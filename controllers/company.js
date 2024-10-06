const fs = require('fs');
const path = require('path');

const companyService = require('../services/company');
const error_processing = require('../common/utils/error_processing');
const processing = require('../common/utils/processing');
const bcrypt = require('bcrypt');
const crypto_string = require('crypto-random-string');
const marketingService = require('../services/marketing');
const smsFunctions = require('../common/controllers/sms');
const particularService = require('../services/particular');
const affiliationService = require('../services/affiliation');
const applicationService = require('../services/application');
const jobService = require('../services/job');
const roleService = require('../services/role');
const email_sender = require('../services/email_sender');
const employeeStatService = require('../services/statsEmployee');
const employerStatService = require('../services/statsEmployer');
const smsService = require('../services/sms');
const ADMIN_RIGHTS = require('../common/utils/enum').adminRights;
const notificationService = require('../services/notification');
const _ = require('lodash');

//configs
const config = require('../configs/environnement/config');
const no_mail = config.no_mail;
const ENTREPRISE = config.permissionLevels.ENTREPRISE_USER;
const EMPLOYER = config.permissionLevels.EMPLOYEE_USER;
const saltRounds = config.sr;


const appreciateApplication = async (req, res) => {
    console.log('CALL APPRECIATE APPLICATION CONTROLLER ' + req.params.idApplication);
    let message;
    const lang = req.query.lang ? req.query.lang : 'en';
    const stateToBecome = req.body.state;
    const reason = req.body.reason ? req.body.reason : '';
    const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
    if (req.jwt && intercept.length !== 0) {
        if (req.query.employer) {
            req.jwt.userId = req.query.employer
        } else {
            message = lang === 'fr' ? "Il manque l'identifiant de l'employeur" : "Missing value, employer ID";
            return res.status(409).json({
                'message': message
            });
        }
    }
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
            // check if the current user is the employer of the current job
            if (job && (String(job.employer) !== String(req.jwt.userId))) {
                const error = new error_processing.BusinessError("Only the job provider can appreciate it", "Seul l'employeur peut valider cette candidature", 403, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
                });
            } else {
                //I change the state of the application rejected or validated
                let newApplication = await applicationService.updateApplication(req.params.idApplication, {
                    "state": req.body.state,
                    reason: reason
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
                    const relatedJob = await jobService.getJob(newApplication.job);
                    req.body.employee = newApplication.employee;
                    req.body.employer = relatedJob.employer;
                    req.body.job = newApplication.job;
                    const joberNotification = {
                        receiver: beforeUpdatedApplication.employee,
                        text: "Votre candidature pour le job " + job.title + " a été retenue",
                        type_event: "save_application",
                        notifUrl: `/fr/contracts`
                    };
                    await notificationService.createNotification(joberNotification);
                } else if (beforeUpdatedApplication.state !== 'validated' && newApplication.state === 'rejected') {
                    // We notify the jober that his application has been rejected
                    message = lang === 'fr' ? `Nous sommes navrés de vous annoncer que votre candidature pour le job <<${job.title} >>a été rejettée` :
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
            message = lang === 'fr' ? "Cette  candidature n'existe pas " : "The application  doesn't exist "
            console.log("The application: " + req.params.idApplication + " doesn't exist ");
            const error = new error_processing.BusinessError(message, 404, "business");
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

const getAllCompanies = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
        const entreprises = await companyService.getAllCompanies(limit, page, req.query);
        console.log('there are companies');
        return res.status(200).json({
            'data': entreprises
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const createCompany = async (req, res) => {
    let validPassword = await processing.securePassword(req.body.password);
    let lang = req.query.lang ? req.query.lang : 'en';
    let sms_code;
    let dataIn;
    let jobUpdatedDetail ;
    console.log(Number(no_mail) === 0);
    try {
        if (validPassword.valid === true) {
            // create the validation with email
            req.body.validationToken = {'token': crypto_string({length: 32}), 'date': Date.now()};
            const hash = await bcrypt.genSalt(Number(saltRounds));
            req.body.password = await bcrypt.hash(req.body.password, hash);
            // if this property affiliation doesn't exist , we create it.
            req.body.affiliation = !req.body.affiliation ? {}: req.body.affiliation ;
            //Add codeAffiliation
            req.body.affiliation.code = await  affiliationService.generateAffiliationCode("company",req.body) ;
            // create the company 
            const entreprise = await companyService.createCompany(req.body);
            if (entreprise) {
                const permissionLevels = [];
                permissionLevels.push(ENTREPRISE, EMPLOYER);
                await employerStatService.createStatsEmployer({userId: entreprise._id});
                console.log('permissions ' + permissionLevels);
                const newRole = {'userId': entreprise._id, 'permissionLevel': permissionLevels};
                await roleService.createRole(newRole);
                const newMarketingView = {'userId': entreprise._id, 'origin': req.body.origin};
                await marketingService.createMarketing(newMarketingView);
                // Increments count
                if (req.body.affiliation.from && req.body.affiliation.from !== "") {

                   let affiliation =await affiliationService.affiliate(req.body.affiliation.from, req.body);
                   if (!affiliation) {
                        message = lang === 'fr' ? 'Inscription non complétée car le code d\'affiliation ne fait référence à aucun utilisateur ou entreprise inscrite sur Jobaas. Veuillez renseigner un code valide ou laissez le champ vide':
                            'Subscription not completed because the affiliation code invalid cause he does not refer to any other user or company with an account. Please fill a valid affiliation code or let the field with no value';
                        console.log(message);
                        return res.status(400).json({
                            'message': message
                        });
                   }
                }
                let mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port :
                    'https://' + config.hostname;
                mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
                console.log('mailLink : ' + mailLink + ' hostname : ' + config.hostname);
                const apiLink = mailLink + '/api/v1/company/' + entreprise._id + '/verify_account?lang=fr&token=' + req.body.validationToken.token;
                console.log('apiLink : ' + apiLink);
                if (Number(no_mail) === 0) {
                    console.log("Email and Sms will be sent !")
                    let email = fs.readFileSync(path.join(__dirname, '/../common/mails/registration_company_fr.html'), 'utf8');
                    email = email.replace('#name', req.body.name);
                    email = email.replace(/#lien/g, apiLink);
                    email = email.replace(/#entreprise/g, req.body.nameCompany);
                    await email_sender.nodemailer_mailgun_sender({
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": entreprise.email.value,
                        "subject": 'Confirmation inscription Jobaas',
                        "html": email
                    });
                    sms_code = await smsFunctions.generateSmsCode("companyService", entreprise._id);
                    const linkNumberValidation = mailLink + '/api/v1/particular/' + entreprise._id + '/verify_phonenumber?lang=fr&pin=' + sms_code;
                    console.log(" validation number " + linkNumberValidation);
                    dataIn = {
                        "text": `Bienvenue sur Jobaas ${req.body.surname},\n
                  Afin de valider votre compte, nous vous prions de cliquer sur le lien suivant:\n  ${linkNumberValidation}\n 
                  En cas de problème, vous pouvez nous contacter aux numéros suivants:  ${config.phonenumbers}. A très bientôt.`
                        , "to": req.body.phoneNumber.value
                    };
                    await smsService.send_notification(dataIn);
                }

                if(req.body.isExternal && req.body.isExternal == true){
                    jobUpdatedDetail = await  jobService.updateJobsEmployer(entreprise._id, entreprise.email.value);
                }

                if (req.query.lang === "en") {
                    return res.status(200).json({
                        'message': 'new company was created',
                        'data': {'id': entreprise._id, jobUpdatedDetail:jobUpdatedDetail},
                    });
                } else {
                    return res.status(200).json({
                        'message': 'Nouvelle company créé',
                        'data': {'id': entreprise._id, jobUpdatedDetail:jobUpdatedDetail},
                    });
                }
            }
        } else {
            let message = (req.query.lang === "en") ? 'Invalid password. there should be at least 8 characters ' +
                'and at least one number, one capital and lower character, ' +
                'and one no alphanumerique character among [!%#_?@]' : 'Mot de passe invalide. Il doit comporter 8 caractères au minimum' +
                'parmi lesquels au moins, un chiffre, une majuscule un miniscule et un caractère spécial parmi [!%#_?@]';
            return res.status(400).json({
                'message': message,
                'data': req.body
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

const getCompanyById = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let meanRatingEmployer = null;
    let message;
    try {
        let userId = req.params.id ? req.params.id : req.jwt.userId;
        const company = await companyService.getCompany('id', userId);
        if (company) {
            delete company.validationToken;
            delete company.password;
            const stats = await employerStatService.getStatsByUser(userId);
            meanRatingEmployer = stats.meanRating;
            console.log(req.query);
            if (req.query.lang === "en") {
                message = 'Company found by id ' + userId;

            } else {
                message = "Entreprise trouvée via l' id " + userId;
            }
            //console.log(message);
            return res.status(200).json({
                'message': message,
                'data': {
                    "company": company,
                    "statsEmployer": meanRatingEmployer
                },
            });
        } else {
            console.log('no company found by id');
            if (req.query.lang === "en") {
                message = 'no company found by id ';
                return res.status(404).json({
                    'message': message
                });
            } else {
                message = "Pas d'company ayant cet id ";
                return res.status(404).json({
                    'message': message
                });
            }
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const updateCompany = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    console.log('update company process');
    delete req.body.state;
    try {
        let enterprise;
        if (req.body.password) {
            const hash = await bcrypt.genSalt(Number(saltRounds));
            req.body.password = await bcrypt.hash(req.body.password, hash);
        }
        let userId = req.params.id ? req.params.id : req.jwt.userId;
        let message;
        enterprise = await companyService.updateCompany(userId, req.body);
        if (!enterprise) {
            if (req.query.lang === "en") {
                message = 'company not found';
            } else {
                message = "Pas d'entreprise trouvé";
            }
            console.log('company not found  by id ' + userId);
            return res.status(404).json({
                'message': message
            });
        }
        if (req.query.lang === "en") {
            message = 'company was updated by id ' + userId;
        } else {
            message = "Mise à jour du compte entreprise avec l'id" + userId;
        }
        console.log('company was updated by id ' + userId);
        // console.log(particular);
        return res.status(200).json({
            'message': message,
            'data': enterprise
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const deleteCompany = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let userId = req.params.id ? req.params.id : req.jwt.userId;
        let message;
        const state = await companyService.deleteCompany(userId);
        if (state) {
            if (req.query.lang === "en") {
                message = 'The comapny was deleted by id : ' + userId;
            } else {
                message = "Suppression du compte company avec l'id: " + userId;
            }
            console.log('The comapny was deleted by id : ' + userId);
            return res.status(200).json({
                'message': message
            });
        } else {
            if (req.query.lang === "en") {
                message = 'No company was found by id ' + userId;
            } else {
                message = "Aucune entreprise trouvée avec l'id " + userId;
            }
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


module.exports = {
    appreciateApplication: appreciateApplication,
    getAllCompanies: getAllCompanies,
    createCompany: createCompany,
    deleteCompany: deleteCompany,
    updateCompany: updateCompany,
    getCompanyById: getCompanyById,

};
