// libraries
const fs = require('fs');
const path = require('path');
const {validationResult} = require('express-validator');
const crypto_string = require('crypto-random-string');
const error_processing = require('../common/utils/error_processing');
const bcrypt = require('bcrypt');
const processing = require('../common/utils/processing');
// services
const particularService = require('../services/particular');
const affiliationService = require('../services/affiliation');
const locationService = require('../services/location');
const applicationService = require('../services/application');
const jobService = require('../services/job');
const roleService = require('../services/role');
const email_sender = require('../services/email_sender');
const marketingService = require('../services/marketing');
const employeeStatService = require('../services/statsEmployee');
const employerStatService = require('../services/statsEmployer');
const contractService = require('../services/contract');
const smsService = require('../services/sms');
const ADMIN_RIGHTS = require('../common/utils/enum').adminRights;
const smsFunctions = require('../common/controllers/sms');
const notificationService = require('../services/notification');
const _ = require('lodash');

//configs
const config = require('../configs/environnement/config');
const no_mail = config.no_mail;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;
const saltRounds = config.sr;

// validate or reject an application by job provider
const appreciateApplication = async(req, res) => {
    console.log('CALL APPRECIATE APPLICATION CONTROLLER ' + req.params.idApplication);
    let message;
    const lang = req.query.lang ? req.query.lang : 'en';
    const stateToBecome = req.body.state;
    const reason = req.body.reason ? req.body.reason : '';
    const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
    if (stateToBecome !== 'validated' && stateToBecome !== 'rejected') {
        const error = new error_processing.BusinessError("This state is not allowed",
            "Ce changement n'est pas autorisé", 409, "business");
        console.log("This state is not allowed : " + stateToBecome);
        return res.status(error.code).json({
            'message': error_processing.process(error)
        });
    }
    try {
        //check the  current user is the job provider of the linked application.
        const beforeUpdatedApplication = await applicationService.getApplication(req.params.idApplication);
        if (beforeUpdatedApplication) {
            //check job
            let job = await jobService.getJob(beforeUpdatedApplication.job._id);
            // check if the current user is the employer of the current job or if it's an admin
            if ((job && (String(job.employer) !== String(req.jwt.userId))) && intercept.length === 0) {
                const error = new error_processing.BusinessError("Only the job provider can appreciate it", "Seul l'employeur peut valider cette candidature", 403, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
                });
            } else {
                //I change the state of the application rejected or validated
                let newApplication = await applicationService.updateApplication(req.params.idApplication, {
                    state: req.body.state,
                    reason: reason,
                    creation_is_assisted: false
                });
                let employeePhoneNumber = await particularService.getParticularPhoneNumber(newApplication.employee);
                if (beforeUpdatedApplication.state !== 'validated' && newApplication.state === 'validated') {
                    let statEmployee = await employeeStatService.getStatsByUser(beforeUpdatedApplication.employee);
                    //updated
                    await employeeStatService.updateStatsEmployee(beforeUpdatedApplication.employee, {nbJobDone: statEmployee.nbJobDone + 1});
                    await jobService.updateJob(beforeUpdatedApplication.job._id, {nbPlacesLeft: job.nbPlacesLeft - 1});
                    // create contract between job provider and jober
                    delete req.body.state;
                    delete req.body.reason;
                    const joberNotification = {
                        receiver: beforeUpdatedApplication.employee,
                        text: "Votre candidature pour le job " + job.title + " a été retenue",
                        type_event: "save_application",
                        notifUrl: `/fr/contracts`
                    };
                    await notificationService.createNotification(joberNotification);
                    message = lang === 'fr' ? `Nous sommes heureux de vous annoncer que votre candidature pour le job <<${job.title} >>a été prise en compte. Consulter l'onglet contrats` :
                        `We are glad to announce you that your application for the job <<${job.title} >> has been accepted. Please check your contracts in menu`;
                    if (Number(no_mail) === 0) {
                        await smsService.send_notification({"text": message, "to": employeePhoneNumber});
                    }
                } else if (beforeUpdatedApplication.state !== 'validated' && newApplication.state === 'rejected') {
                    // We notify the jober that his application has been rejected
                    message = lang === 'fr' ? `Nous sommes navrés de vous annoncer que votre candidature pour le job <<${job.title} >>a été rejettée. \n Raison : ${req.body.reason}` :
                        `We sorry the announce you that your application for the job <<${job.title} >> has been rejected`;
                    if (Number(no_mail) === 0) {
                        await smsService.send_notification({"text": message, "to": employeePhoneNumber});
                    }
                    const joberNotification = {
                        receiver: beforeUpdatedApplication.employee,
                        text: "La candidature pour le job " + job.title + " a été rejettée",
                        type_event: "application",
                        notifUrl: `/fr/job/${newApplication.job}`
                    };
                    await notificationService.createNotification(joberNotification);
                }
                if (newApplication) {
                    console.log('application state was updated to : ' + stateToBecome + ' for the id :' + req.params.idApplication);
                    message = lang === 'fr' ? 'Votre décision pour cette candidature a été enregistrée' : 'your appreciation has been save for the application';
                    return res.status(200).json({
                        'message': message
                    })
                } else {
                    message = lang === "fr" ? "Une erreur s'est produite, veuillez réessayer" : "something went wrong, Please try again";
                    console.log("something went wrong, Please try again");
                    return res.status(500).json({
                        'message': message
                    });
                }
            }
        } else {
            message = lang === 'fr' ? "Cette  candidature n'existe pas " : "The application  doesn't exist ";
            console.log("The application: " + req.params.idApplication + " doesn't exist ");
            const error = new error_processing.BusinessError(message, "Cette  candidature n'existe pas ", 404, "business");
            return res.status(error.code).json({
                'message': error_processing.process(error)
            });
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};




const getAllParticulars = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query) {
            if (req.query.page) {
                req.query.page = parseInt(req.query.page);
                page = Number.isInteger(req.query.page) ? req.query.page : 0;
            }
        }
      const particulars = await particularService.getAllParticulars(limit, page, req.query);
        message = lang === "fr" ? "Les particuliers existent" : "there are particulars";
        return res.status(200).json({
            'message': message,
            'data': particulars
        });


    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const verifyPhoneNumber = async(req, res) => {
        console.log('Controller to Verify phoneNumber !');
        let currentAccount =  await particularService.getParticular('id', req.jwt.userId);
        let userId = req.jwt.userId;
        let message;
        try {
            if (currentAccount) {
                if (new Date() <= new Date(currentAccount.phoneNumber.requestIdExpired)) {
                    console.log(currentAccount.phoneNumber.requestId);
                    if (Number(req.query.pin) === currentAccount.phoneNumber.requestId) {
                        currentAccount.phoneNumber.valid = true;
                        await particularService.updateParticular(userId,currentAccount);
                        message = req.query.lang === 'fr'  ? "numéro verifié avec succès !" :
                            "phoneNumber successful verified";
                        return res.status(200).json({
                            'message':  message
                        });
                    } else {
                        message = req.query.lang ? 'Code incorrect' : 'the code is wrong';
                        return res.status(400).json({
                            'message':  message
                        });
                    }
                } else {
                    message = req.query.lang ? "Le code a expiré, essayez à nouveau s'il vous plait"
                        : "the code expired, please try again";
                    return res.status(400).json({
                        'message':  message
                    });
                }
            } else {
                message = req.query.lang === 'fr' ? "Ce compte n\'existe pas. Veuillez créer un compte d\'abord" :
                    "It seems this account does not exist. Please register";
                console.log('It seems this account does not exist. Please register');
                return res.status(404).json({
                    'message': message
                });
            }
        } catch (e) {
            console.log(e.message);
            const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
            return res.status(500).json({
                'message': error_processing.process(err)
            });
        }
};

const createParticular = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    let sms_code;
    let dataIn;
    let message;
    let mailLink;
    let jobUpdatedDetail ;
    const mailLinkDev = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
    mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLinkDev;
    try {
        if (req.body.email.value === "") {
            delete req.body.email.value;
        }
        const errors = validationResult(req);
        // I check whether there are errors or not
        if (!errors.isEmpty()) {
            const errorList = errors.array();
            res.status(400).json({message: errorList[0].msg});
            return;
        }
        if (req.body.locationPlaceId) {
            const geoLocation = await locationService.getLocationByPlaceId(req.body.locationPlaceId);
            req.body.geo_coordinates = {
                "longitude": geoLocation.location.long,
                "latitude": geoLocation.location.lat
            };
            delete req.body.locationPlaceId;
        }
        let validPassword = await processing.securePassword(req.body.password);
        if (validPassword.valid) {
            console.log('Call create particular controller');
            // security control for business
            // check the state
            if (req.body.state.includes('admin')) {
                if (!req.body.email.value.endsWith('@jobaas.cm')) {
                    message = lang === 'fr' ? "Vous n'avez pas les droits d'administrateur" : 'Bad request you cannot be set admin';
                    return res.status(400).json({
                        'message': message
                    });
                }
            }
            req.body.name = req.body.name.replace("'", "");
            req.body.surname = req.body.surname.replace("'", "");
            req.body.validationToken = {'token': crypto_string({length: 32}), 'date': Date.now()};
            const hash = await bcrypt.genSalt(Number(saltRounds));
            req.body.password = await bcrypt.hash(req.body.password, hash);
            req.body.affiliation = !req.body.affiliation ? {}: req.body.affiliation ;
            req.body.affiliation.code = await  affiliationService.generateAffiliationCode("particular",req.body) ;
            const particular = await particularService.createParticular(req.body);
            if (particular) {
                const permissionLevels = [];
                req.body.state.forEach((element) => {
                    if (element === 'employee') {
                        permissionLevels.push(EMPLOYEE);

                    } else if (element === 'employer') {
                        permissionLevels.push(EMPLOYER);
                    }
                });
                // Increments count
                if (req.body.affiliation.from && req.body.affiliation.from !== "") {
                   let affiliation = await affiliationService.affiliate(req.body.affiliation.from, req.body);
                   if (!affiliation) {
                        message = lang === 'fr' ? 'Inscription non complétée car le code d\'affiliation ne fait référence à aucun utilisateur ou entreprise inscrite sur Jobaas. Veuillez renseigner un code valide ou laissez le champ vide':
                            'Subscription not completed because the affiliation code invalid cause he does not refer to any other user or company with an on account on Jobaas. Please fill a valid affiliation code or let the field with no value';
                        console.log(message);
                        return res.status(400).json({
                            'message': message
                        });
                   }
                }
                await employerStatService.createStatsEmployer({userId: particular._id});
                await employeeStatService.createStatsEmployee({userId: particular._id});
                console.log('permissions ' + permissionLevels);
                const newRole = {'userId': particular._id, 'permissionLevel': permissionLevels};
                await roleService.createRole(newRole);
                const newMarketingView = {'userId': particular._id, 'origin': req.body.origin};
                await marketingService.createMarketing(newMarketingView);
                // We define mailLink
                console.log('mailLink : ' + mailLink + ' hostname : ' + config.hostname);
                const apiLink = mailLink + '/api/v1/particular/' + particular.id + '/verify_account?lang=fr&token=' + req.body.validationToken.token;
                console.log('apiLink : ' + apiLink);
                let email = fs.readFileSync(path.join(__dirname, '/../common/mails/registration_fr.html'), 'utf8');
                const footer  = fs.readFileSync(path.join(__dirname, '/../common/mails/footer.html'), 'utf8');
                email = email.replace('#name', req.body.surname);
                email = email.replace('#footer', footer);
                email = email.replace(/#lien/g, apiLink);
                sms_code = await smsFunctions.generateSmsCode("particular", particular._id);
                const linkNumberValidation = mailLink + '/api/v1/particular/' + particular._id + '/verify_phonenumber?lang=fr&pin=' + sms_code;
                console.log(" validation number "+linkNumberValidation) ;
                dataIn = {
                    "text": ` Bienvenue sur Jobaas ${req.body.surname},\nAfin de valider votre compte, nous vous prions de cliquer sur le lien suivant:\n ${linkNumberValidation}\nEn cas de problème, vous pouvez nous contacter aux numéros suivants:  ${config.phonenumbers}. A très bientôt.`
                    , "to": req.body.phoneNumber.value
                };
                //TO DO PUT DEV AFTER
                console.log("no mail in particular controller " + no_mail);
                if (Number(no_mail) === 0) {
                    console.log('after the no mail condition');
                    if (req.body.email.value && req.body.email.value !== "") {
                        await email_sender.nodemailer_mailgun_sender({
                            "from": 'Jobaas <no_reply@jobaas.cm>',
                            "to": particular.email.value,
                            "subject": 'Confirmation inscription Jobaas',
                            "html": email
                        });
                    }
                    await smsService.send_notification(dataIn);
                }

                if(req.body.isExternal && req.body.isExternal == true){
                    jobUpdatedDetail = await jobService.updateJobsEmployer(particular._id, particular.email.value);
                }

                return res.status(200).json({
                    'data': {'id': particular._id, jobUpdatedDetail:jobUpdatedDetail}
                });
            }
        } else {
            message = lang === 'fr' ? 'Mot de passe invalide. Il doit comporter 8 caractères au minimum' +
                'parmi lesquels au moins, un chiffre, une majuscule un miniscule et un caractère spécial parmi [!%#_?@]' :
                'Invalid password. there should be at least 8 characters ' +
                'and at least one number, one capital and lower character, ' +
                'and one no alphanumerique character among [!%#_?@]';
            console.log(message);
            return res.status(400).json({
                'message': message
            });
        }
    } catch (e) {
        const forgotPasswordUrl = mailLink + '/fr/reset-password';
        if (Number(no_mail) === 0) {
            await email_sender.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": ['leonelelanga@yahoo.fr', 'info@jobaas.cm',"cto@jobaas.cm"],
                "subject": ` [${config.env}] Erreur Backend inscription pour un compte`,
                "html": `erreur inscription pour cet identifiant nom: ${req.body.name} numero de telepehone 
                : ${req.body.phoneNumber.value} \n . Raison: ${e.message}`
            });
            if(e.message.includes("E11000 duplicate key error collection")){
                await smsService.send_notification(
                    {
                        "text": `Vous avez déjà un compte avec ce numéro ou cette addresse email, si vous avez oublié le mot de passe faites mot de passe oublié s'il vous plait: \n ${forgotPasswordUrl}`,
                        "to": req.body.phoneNumber.value
                    });
            }
        }
        console.log('Attemps to create an account :  ' + req.body.phoneNumber.value);
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


const createParticularWithoutPassword = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    let sms_code;
    let dataIn;
    let message;
    try {
        if (req.body.email.value === "") {
            delete req.body.email.value;
        }
        const errors = validationResult(req);
        // I check whether there are errors or not
        if (!errors.isEmpty()) {
            const errorList = errors.array();
            res.status(400).json({message: errorList[0].msg});
            return;
        }
        let validPassword = await processing.securePassword(req.body.password);
        if (validPassword.valid) {
            console.log('Call create particular controller without password');
            // security control for business
            // check the state
            if (req.body.state.includes('admin')) {
                if (!req.body.email.value.endsWith('@jobaas.cm')) {
                    message = lang === 'fr' ? "Vous n'avez pas les droits d'administrateur" : 'Bad request you cannot be set admin';
                    return res.status(400).json({
                        'message': message
                    });

                }
            }

            req.body.name = req.body.name.replace("'", "");
            req.body.surname = req.body.surname.replace("'", "");
            // create the validation with email
            req.body.validationToken = {'token': crypto_string({length: 32}), 'date': Date.now()};
            const hash = await bcrypt.genSalt(Number(saltRounds));
            req.body.password = await bcrypt.hash(req.body.password, hash);
            // create the particular service
            req.body.creation_is_assisted = true;
            const particular = await particularService.createParticular(req.body);
            if (particular) {
                const permissionLevels = [];
                req.body.state.forEach((element) => {
                    if (element === 'employee') {
                        permissionLevels.push(EMPLOYEE);

                    } else if (element === 'employer') {
                        permissionLevels.push(EMPLOYER);
                    }
                });
                await employerStatService.createStatsEmployer({userId: particular._id});
                await employeeStatService.createStatsEmployee({userId: particular._id});
                console.log('permissions ' + permissionLevels);
                const newRole = {'userId': particular._id, 'permissionLevel': permissionLevels};
                await roleService.createRole(newRole);
                const newMarketingView = {'userId': particular._id, 'origin': req.body.origin};
                await marketingService.createMarketing(newMarketingView);
                let mailLink;
                // We define mailLink
                mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
                //for   prod host we must add  wwww before the link
                mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
                console.log('mailLink : ' + mailLink + ' hostname : ' + config.hostname);
                const apiLink = mailLink + '/api/v1/particular/' + particular.id + '/verify_account?lang=fr&token=' + req.body.validationToken.token;
                console.log('apiLink : ' + apiLink);
                let email = fs.readFileSync(path.join(__dirname, '/../common/mails/registration_fr.html'), 'utf8');
                email = email.replace('#name',    req.body.surname);
                email = email.replace('#mail',    req.body.email.value);
                email = email.replace('#password',  req.body.rawPassword);
                email = email.replace(/#lien/g, apiLink);
                //We  send a SMS for phonenumber's validation
                sms_code = await smsFunctions.generateSmsCode("particular", particular._id);
                const linkNumberValidation = mailLink + '/api/v1/particular/' + particular._id + '/verify_phonenumber?lang=fr&pin=' + sms_code;
                console.log("validation number " + linkNumberValidation);
                // TODO REFACTORING
                dataIn =    {
                    "text": `Bienvenue sur Jobaas  ${req.body.surname}. \nAfin de vous connecter, utilisez ce mot de passe: ${req.body.rawPassword}\nPour activer votre compte, cliquer sur le lien suivant: ${linkNumberValidation}\n Pour nous contacter:  ${config.phonenumbers}. A très bientôt.`
                    , "to": req.body.phoneNumber.value
                };
                //TO DO PUT DEV AFTER
                if (Number(no_mail) === 0) {
                    console.log('after the no mail condition');
                    if (req.body.email.value && req.body.email.value !== "") {
                        await email_sender.nodemailer_mailgun_sender({
                            "from": 'Jobaas <no_reply@jobaas.cm>',
                            "to": particular.email.value,
                            "subject": 'Confirmation inscription Jobaas',
                            "html": email
                        });
                    }
                    await smsService.send_notification(dataIn);
                }
                return res.status(200).json({
                    'data': {'id': particular._id}
                });
            }
        } else {
            message = lang === 'fr' ? 'Mot de passe invalide. Il doit comporter 8 caractères au minimum' +
                'parmi lesquels au moins, un chiffre, une majuscule un miniscule et un caractère spécial parmi [!%#_?@]' :
                'Invalid password. there should be at least 8 characters ' +
                'and at least one number, one capital and lower character, ' +
                'and one no alphanumerique character among [!%#_?@]';
            console.log(message);
            return res.status(400).json({
                'message': message
            });
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getParticularById = async (req, res) => {
  let meanRatingEmployer = null;
  let meanRatingEmployee = null;
    let message;
    const lang = req.query.lang ? req.query.lang : 'en';
  try {
      let userId = req.params.id ? req.params.id : req.jwt.userId;
      //console.log(userId);
    const particular = await particularService.getParticular('id', userId);
    if (particular) {
        delete particular.validationToken;
        delete particular.password;
        console.log("state : " + particular.state);
      if (particular.state.includes('employer')) {
        const stats = await employerStatService.getStatsByUser(userId);
        meanRatingEmployer = stats.meanRating;
      }
      if (particular.state.includes('employee')) {
        const stats = await employeeStatService.getStatsByUser(userId);
        meanRatingEmployee = stats.meanRating;
      }
      //console.log(message);
      return res.status(200).json({
        'data': {
          "particular": particular,
          "statsEmployer": meanRatingEmployer,
          "statsEmployee": meanRatingEmployee
        },
      });
    } else {

        message = lang === "fr" ? 'Pas de particular ayant cet id ' : 'no particular found by id ';
        return res.status(404).json({
            'message': message
        });

    }
  } catch (e) {
      console.log(e.message);
      const err = new error_processing.ServerError(e, lang);
      return res.status(500).json({
          'message': error_processing.process(err)
      });
  }
};


const updateParticular = async (req, res) => {
    console.log('update particular process');
    let message;
    const lang = req.query.lang ? req.query.lang : 'en';
  try {
    let particular;
      if (req.body.password) {
          const hash = await bcrypt.genSalt(Number(saltRounds));
          if (processing.securePassword(req.body.password)) {
              req.body.password = await bcrypt.hash(req.body.password, hash);
          } else {
              message = lang === 'fr' ? 'Mot de passe invalide. Il doit comporter 8 caractères au minimum' +
                  'parmi lesquels au moins, un chiffre, une majuscule un miniscule et un caractère spécial parmi [!%#_?@]' :
                  'Invalid password. there should be at least 8 characters ' +
                  'and at least one number, one capital and lower character, ' +
                  'and one no alphanumerique character among [!%#_?@]';
              return res.status(400).json({
                  'message': message
              });
          }
      }
    let userId;

    if (req.params.id) {
      userId = req.params.id;
    } else {
      userId = req.jwt.userId;
      if(req.body.state){
          console.log('you are not allowed to change the state : ' + userId);
          message = lang === "fr" ? "Vous n'avez pas les droits de modifier cette information" : "You are not allowed to change the state";
          return res.status(403).json({
              'message': message
          });
      }
    }
      particular = await particularService.updateParticular(userId, req.body);
    if (!particular) {
        message = lang === "fr" ? "Pas d'utilisateur trouvé avec l'id " + userId : 'particular not found  id ' + userId;
        console.log('particular not found  id ' + userId);
        return res.status(404).json({
            'message': message
        });
    }
      message = lang === "fr" ? "Mise à jour du compte utilisateur" : 'particular was updated';
      console.log('particular was updated');
    // console.log(particular);
    return res.status(200).json({
      'message': message,
      'data': particular,
    });
  } catch (e) {
      console.log(e.message);
      const err = new error_processing.ServerError(e, lang);
      return res.status(500).json({
          'message': error_processing.process(err)
      });
  }
};

const deleteParticular = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    let message;
  try {
    let userId;
    if (req.params.id) {
      userId = req.params.id;
    } else {
      userId = req.jwt.userId;
    }

    const state = await particularService.deleteParticular(userId);
    if (state) {
        message = lang === "fr" ? "Suppression du compte utilisateur avec l'id: " + userId : "the particular was deleted by id : " + userId;
        console.log('the particular was deleted by id : ' + userId);
      return res.status(200).json({
        'message': message
      });
    } else {

        message = lang === "fr" ? "Aucun compte utilisateur n'a été trouvé" : 'No particular was found';
        console.log(message);
        return res.status(404).json({
            'message': message
        });
    }
  } catch (e) {
      console.log(e.message);
      const err = new error_processing.ServerError(e, lang);
      return res.status(500).json({
          'message': error_processing.process(err)
      });
  }
};

const getBestJobers = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';

    try {
        const filterParameters = {};
        const bestJobers = await particularService.getBestJobers(filterParameters);
        return res.status(200).json({
            'data': bestJobers
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getBestJober = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const filterParameters = {id: req.jwt.userId};
        const bestJober = await particularService.getBestJober(filterParameters);
        return res.status(200).json({
            'data': bestJober
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

module.exports = {
    getAllParticulars: getAllParticulars,
    createParticular: createParticular,
    createParticularWithoutPassword:createParticularWithoutPassword,
    deleteParticular: deleteParticular,
    updateParticular: updateParticular,
    getParticularById: getParticularById,
    getBestJobers: getBestJobers,
    getBestJober: getBestJober,
    verifyPhoneNumber: verifyPhoneNumber,
    appreciateApplication:appreciateApplication
};
