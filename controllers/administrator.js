// libraries
const fs = require('fs');
const path = require('path');
const crypto_string = require('crypto-random-string');
const error_processing = require('../common/utils/error_processing');
const processing = require('../common/utils/processing');
const bcrypt = require('bcrypt');
const _ = require('lodash');

// services
const administratorService = require('../services/administrator');
const particularService = require('../services/particular');
const locationService = require('../services/location');
const companyService = require('../services/company');
const jobService = require('../services/job');
const transactionService = require('../services/transaction');
const applicationService = require('../services/application');
const contractService = require('../services/contract');
const roleService = require('../services/role');
const emailsenderService = require('../services/email_sender');
const employerStatService = require('../services/statsEmployer');
const employeeStatService = require('../services/statsEmployee');
const metafileService = require('../services/metafile');
const notificationService = require('../services/notification');
const smsService = require('../services/sms');

//configs
const config = require('../configs/environnement/config');
const particular = require('../services/particular');
const no_mail = config.no_mail;
const ADMIN = config.permissionLevels.ADMIN;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;
const RH = config.permissionLevels.RH_USER;
const COMMERCIAL = config.permissionLevels.COMMERCIAL_USER;
const COMMUNICATION = config.permissionLevels.COMMUNICATION_USER
const saltRounds = config.sr;


const getAllAdministrators = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
        const administrators = await administratorService.getAllAdministrators(limit, page, req.query);
        console.log('there are administrators');
        return res.status(200).json({
            'data': administrators
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const changeRole = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let jobProviderNotification;
    try {
        const userId = req.params.userId ? req.params.userId : req.jwt.userId;
        let role = req.body.role === 'employee' ? EMPLOYEE : EMPLOYER;
        const action = req.body.role === 'employee' ? lang === 'fr' ? "postuler pour un  job" : "apply for a job " : lang === 'fr' ? "publier un nouveau job" : "publish a new job";
        const notifUrl = req.body.role === 'employee' ? '/fr/jobs' : '/fr/new-job';
        const user = await particularService.updateRoleByUser(userId, req.body.role);
        if (user) {
            const changedRole = await roleService.updateRoleByUser(userId, role);
            if (changedRole) {
                const err = new error_processing.BusinessError("The role has been updated", "Le role a été mis à jour",
                 200, "business", req.query.lang);
                const textNotification = lang === 'fr' ? "Vous pouvez désormais  << " + action + " >> " : "You can now : <<" + action + ">>";
                jobProviderNotification = {
                    receiver: userId,
                    text: textNotification,
                    type_event: "change_role",
                    notifUrl: notifUrl
                };
                await notificationService.createNotification(jobProviderNotification);
                return res.status(200).json({
                    'message': error_processing.process(err)
                });
            } else {
                const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
                return res.status(500).json({
                    'message': error_processing.process(err)
                });
            }
        } else {
            const err = new error_processing.BusinessError("The user does not exist", "Cet utilisateur n'existe pas", 404, "business", req.query.lang);
            return res.status(404).json({
                'message': error_processing.process(err)
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

const createAdministrator = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        message = lang === 'fr' ? 'Vous ne pouvez pas avoir ce role' :
         'Bad request you cannot have this role';
        if (req.jwt) {
            const intercept_admin = _.intersectionWith(req.jwt.permissionLevel, [SUP_ADMIN, ADMIN]);
            const intercept = _.intersectionWith(req.jwt.permissionLevel, [SUP_ADMIN, ADMIN, RH]);
            if (intercept.length === 0 && (req.body.state.includes('controller') || req.body.state.includes('commercial')) ) {
                return res.status(400).json({
                    'message': message
                });
            } else if (req.body.state.includes('rh') && intercept_admin.length === 0) {
                //Only admin and supAdmin can create RH accounts
                return res.status(400).json({
                    'message': message
                });
            }
        } else {
            if (req.body.state.includes('controller')) {
                return res.status(400).json({
                    'message': message
                });
            }
        }
        if (req.body.locationPlaceId) {
            const geoLocation = await locationService.getLocationByPlaceId(req.body.locationPlaceId);
            req.body.geo_coordinates = {
                "longitude": geoLocation.location.lng,
                "latitude": geoLocation.location.lat
            };
            delete req.body.locationPlaceId;
        }
        let validPassword = processing.securePassword(req.body.password);
        if (validPassword.valid) {
            console.log('Call create administrator controller');
            if (req.body.state.includes('admin') || req.body.state.includes('rh')) {
                if (!req.body.email.value.endsWith('@jobaas.cm')) {
                    return res.status(400).json({
                        'message': message
                    });
                }
            }

            if (req.body.email.value === config.cto_mail) {
                req.body.state = ['supAdmin'];
                req.body.phoneNumber.valid = true;
            }
            if (config.env !== 'production') {
                if (req.body.email.value === 'gbouki@jobaas.cm'
                    || req.body.email.value === 'jordanet@jobaas.cm') {
                    req.body.state = ['supAdmin'];
                    req.body.valid = true;
                    req.body.email.valid = true;
                    req.body.phoneNumber.valid = true;
                }
            }
            // create the validation with email
            req.body.validationToken = {'token': crypto_string({length: 32}), 'date': Date.now()};
            const hash = await bcrypt.genSalt(Number(saltRounds));
            req.body.password = await bcrypt.hash(req.body.password, hash);

            // create the administrator service
            const administrator = await administratorService.createAdministrator(req.body);
            if (administrator) {
                const permissionLevels = [];
                req.body.state.forEach((element) => {
                    if (element === 'supAdmin') {
                        permissionLevels.push(SUP_ADMIN);
                    } else if (element === 'admin') {
                        permissionLevels.push(ADMIN);
                    } else if (element === 'controller') {
                        permissionLevels.push(CONTROLLER);
                    } else if (element === 'rh') {
                        permissionLevels.push(RH)
                    } else if (element === 'commercial') {
                        permissionLevels.push(COMMERCIAL)
                    } else if (element === 'communication') {
                        permissionLevels.push(COMMUNICATION)
                    }
                });
                console.log('permissions ' + permissionLevels);
                const newRole = {'userId': administrator._id, 'permissionLevel': permissionLevels};
                await roleService.createRole(newRole);
                let mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
                mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
                console.log('mailLink : ' + mailLink + ' hostname : ' + config.hostname);
                const apiLink = mailLink + '/api/v1/administrator/' + administrator.id + '/verify_account?token=' + req.body.validationToken.token;
                console.log('apiLink : ' + apiLink);
                if (Number(no_mail) === 0) {
                    let email = fs.readFileSync(path.join(__dirname, '/../common/mails/registration_fr.html'), 'utf8');
                    email = email.replace('#name', req.body.name);
                    email = email.replace(/#lien/g, apiLink);
                    await emailsenderService.nodemailer_mailgun_sender({
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": administrator.email.value, "cc": '', "bcc": '',
                        "subject": 'Confirmation inscription Jobaas',
                        "html": email,
                        "text": '',
                    });
                }
                message = req.query.lang === 'fr' ? 'Un nouvel admin a été crée' : 'new administrator was created';
                return res.status(200).json({
                    'message': message,
                    'data': {'id': administrator._id},
                });
            }
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
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getAdministratorById = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let userId = req.params.id ? req.params.id : req.jwt.userId;
        const administrator = await administratorService.getAdministrator('id', userId);
        if (administrator) {
            const message = 'administrator found';
            console.log('administrator found by id : ' + userId);
            return res.status(200).json({
                'message': message,
                'data': administrator,
            });
        } else {
            const message = 'no administrator found';
            console.log('no administrator found by id : ' + userId);
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

const updateAdministrator = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let userId;
    let message;
    let administrator;
    console.log('update administrator process');
    try {
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
        if (req.params.id) {
            userId = req.params.id;
        } else {
            userId = req.jwt.userId;
            if (req.body.state) {
                console.log('you are not allowed to change the state : ' + userId);
                return res.status(403).json({
                    'message': 'You are not allowed to change the state'
                });
            }
        }
        administrator = await administratorService.updateAdministrator(userId, req.body);
        if (!administrator) {
            message = 'administrator not found';
            console.log('administrator not found  id ' + userId);
            return res.status(404).json({
                'message': message
            });
        }
        message = 'administrator was updated';
        console.log('administrator was updated by id ' + userId);
        return res.status(200).json({
            'message': message,
            'data': administrator
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const deleteAdministrator = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let userId = req.params.id ? req.params.id : req.jwt.userId;
        const state = await administratorService.deleteAdministrator(userId);
        if (state) {
            console.log('the administrator was deleted by id : ' + userId);
            const error = new error_processing.BusinessError("the administrator was deleted", "La ressource administrator a été supprimée", 200, "business", req.query.lang);
            return res.status(error.code).json({
                'message': error_processing.process(error)
            })
        } else {
            console.log('no administrator found by id : ' + userId);
            const error = new error_processing.BusinessError("", "", 404, "classic", req.query.lang, "administrator");
            return res.status(error.code).json({
                'message': error_processing.process(error)
            })
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

//
const activateAccount = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        if (req.params.idParticular) {
            const particular = await particularService.getParticular("id", req.params.idParticular);
            if (particular.phoneNumber.value) {
                await particularService.updateParticular(particular._id, {"phoneNumber.valid": true, "valid": true})
            } else if (particular.email.value && particular.email.value !== "") {
                await particularService.updateParticular(particular._id, {"email.valid": true, "valid": true})
            } else {
                const err = new error_processing.BusinessError("The user does not exist", "Cet utilisateur n'existe pas", 404, "business", req.query.lang);
                return res.status(404).json({
                    'message': error_processing.process(err)
                });
            }
        } else if (req.params.idCompany) {
            const company = await companyService.getCompany("id", req.params.idCompany);
            if (company.phoneNumber.value) {
                await companyService.updateCompany(company._id, {"phoneNumber.valid": true, "valid": true})
            } else if (company.email.value && particular.email.value !== "") {
                await companyService.updateCompany(company._id, {"email.valid": true, "valid": true})
            } else {
                const err = new error_processing.BusinessError("The company does not exist", "Cet entreprise  n'existe pas", 404, "business", req.query.lang);
                return res.status(404).json({
                    'message': error_processing.process(err)
                });
            }
        }
        return res.status(200).json({
            'message': "account activated"
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const validateJob = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    let jobProviderNotification;
    const state = "validated";
    let notifUrl = '/fr/job/' + req.params.idJob;
    try {
        // I get the current job
        let job = await jobService.getJob(req.params.idJob);
        // I check the value of the state and the existence of the job
        if (job && job.state !== state) {
            // I update the state of the job
            await jobService.updateJob(req.params.idJob,
                                        {
                                            "isValid": true,
                                         "state": state,
                                         "validationInfos": {
                                            "validationDate": Date.now(),
                                            "validatorId": req.jwt.userId
                                         }
                                         });
            if ( job.tags.length > 0) {
                let jobers = await particularService.getAllParticulars(0, 0, {"tags": job.tags}, false);
                await particularService.getParticular("id", job.employer);
                const statsUser = await employerStatService.getStatsByUser(job.employer);
                await employerStatService.updateStatsEmployer(job.employer, {nbJobValidated: statsUser.nbJobValidated + 1});
                message = req.query.lang === 'fr' ? "Le job a été validé et " + jobers.particulars.length + " jobeur(s) ont été notifiés !" : "the job  has been  validated and " + jobers.particulars.length + " jober(s) have been notified !";
                //job provider notification
                const textNotification = req.query.lang === 'fr' ? "Votre job intitulé << " + job.title + " >> a été validé, il sera désormais visible par nos jobeurs. \n lien du job" : "your  job title << " + job.title + " >> has been validated , therefore it will be visible by all jobers.";
                jobProviderNotification = {
                    receiver: job.employer,
                    text: textNotification,
                    type_event: "job_validation",
                    notifUrl: notifUrl
                };
                await notificationService.createNotification(jobProviderNotification);
                if (req.query.lang === 'en') {
                    message = "the job  has been  validated and " + jobers.particulars.length + " jober(s) have been notified !";
                } else {
                    message = "Le job a été validé et " + jobers.particulars.length + " jobeur(s) ont été notifiés !";
                }
                // increment stat
                console.log("the job " + req.params.idJob + " has been  validated and " + jobers.particulars.length + " jober(s) have been notified !");
                return res.status(200).json({
                    'message': message
                });
            }
        } else if (job && job.state === state){
            message = req.query.lang === "fr" ? "cette mission  a déjà été validée" : "this job has already been validated";
            return res.status(400).json({
                'message': message
            });
        }  else  {
            let error;
            error = new error_processing.BusinessError(" ", " ", 404, "classic", req.query.lang, "job");
            console.log("The job doesn't exist");
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

const rejectJob = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    let jobProviderNotification;
    const state = "rejected";
    try {
        // I get the current job
        let job = await jobService.getJob(req.params.idJob);
        // I check the value of the state and the existence of the job
        if (job && job.state !== state ) {
            // I update the state of the job
            const reason = req.body.reason ?  req.body.reason : '' ;
            await jobService.updateJob(req.params.idJob, {state: state, reason: reason });
            let notifUrl = '/fr/job/' + req.params.idJob;
            message =   req.query.lang === 'fr' ? "Votre job intitulé " + job.title + " a été réjété parce que: << "+reason +">>": "your  job title " + job.title + " has been rejected because << "+reason +">>",
            jobProviderNotification = {
                receiver: job.employer,
                text: message,
                type_event: "job_validation",
                notifUrl: notifUrl
            };
            await notificationService.createNotification(jobProviderNotification);

            return res.status(200).json({
                'message': message
            });
        }
        else if (job && job.state === state){
            message = req.query.lang === "fr" ? "cette mission  a déjà été rejetée" : "this job has already been rejected";
            return res.status(409).json({
                'message': message
            });
        }
        else  {
            let error;
            error = new error_processing.BusinessError(" ", " ", 404, "classic", req.query.lang, "job");
            console.log("The job doesn't exist");
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

//TODO
const affectJoberToJob = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        // We create an application for the jober we choose
        await applicationService.createApplication({
            employee: req.params.idJober,
            job: req.params.idJob,
            state: "validated",
            motivations: "candidature proposée par Jobaas"
        });
        // We create  contract
        const job = await jobService.getJob(req.params.idJob);
        const jober = await particularService.getParticular("id", req.params.idJober);
        const jobProvider = await particularService.getParticular("id", job.employer);
        if(job.frequency.isRegular === false){
            const paymentPerTransaction = (job.employerPayment / 2);
            await contractService.createContract({
                    "employer": job.employer,
                    "employee": req.params.idJober,
                    "nbTransactionsTodo": 1,
                "paymentPerTransaction": paymentPerTransaction,
                "state": "paid",
                "nbTransactionsDone": 1
                }
            )
        }
        const transactionsForJob = await transactionService.getAllTransactions(3, 0,
            {"job": job._id});
        console.log(transactionsForJob);
        // Transaction's notification
        const notificationMessage = "Bonjour " + jober.name + ".\n" +
            "Vous avez été retenu pour le job suivant.\n"
            + "Title : " + job.title + "\n Ville : " + job.town + "\n Description : " + job.description +
            "\n Vous pouvez contacter votre employeur au numéro suivant " + jobProvider.phoneNumber.value;

        const joberNotification = {
            receiver: req.params.idJober,
            text: notificationMessage
            , type_event: "save_application",
            notifUrl: `/fr/job/${job._id}`
        };
        await notificationService.createNotification(joberNotification);
        let deltaMean = 0.3;
        let statEmployee = await employeeStatService.getStatsByUser(req.params.idJober);
        //updated

        // we create an evalution
        await employeeStatService.updateStatsEmployee(req.params.idJober, {
            "meanRating": Math.min(5,statEmployee.meanRating + deltaMean),
            nbEvaluations: statEmployee.nbEvaluations + 1,
            nbJobDone: statEmployee.nbJobDone + 1
        });
        if (Number(no_mail) === 0) {
            let emailTemplate = fs.readFileSync(path.join(__dirname, "/../common/mails/application_" + lang + ".html"), "utf8");
            let email;
            email = emailTemplate.replace("#name", jober.name);
            email = email.replace("#title", job.title);
            email = email.replace("#town", job.town);
            email = email.replace("#description", job.description);
            email = email.replace(/#lien/g, "vos jobs");
            console.log('after the no mail condition');
            await emailsenderService.nodemailer_mailgun_sender({
                "from": 'Jobaas  <no_reply@jobaas.cm>',
                "to": jober.email.value,
                "subject": "Candidature selectionnée",
                "html": email
            });
            await smsService.send_notification({
                "to": jober.phoneNumber.value,
                "text": notificationMessage
            });
        }
        //Create contract between job provider and jober
        delete req.body.state;
        const relatedJob = await jobService.getJob(req.params.idJob);
        await jobService.updateJob(relatedJob._id, {nbPlacesLeft: relatedJob.nbPlacesLeft - 1});
        message = lang === "fr" ? "le candidat a bien été affecté au job" : "the jober has been saved for the job";
        return res.status(200).json({
            'message': message
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const changeMetaFile = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let message;
        const idMeta = req.params.idMeta;
        const metafile = await metafileService.updateMetafile(idMeta, req.body);
        if (metafile) {
            message = 'metafile was updated by id ' + idMeta;
            console.log(message);
            return res.status(200).json({
                'message': message
            });
        } else {
            const err = new error_processing.BusinessError("", "", 404, "classic", req.query.lang, "metafile");
            return res.status(404).json({
                'message': error_processing.process(err)
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

const getParticularByName = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const users = await particularService.searchParticularByName(req.query.name);
        return res.status(200).json({
            'message': users
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const invalidateJob = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    console.log("invalidate Job : " + req.params.idJob);
    try {
        const result = await jobService.updateJob(req.params.idJob, {"isValid": false, "state": "expired"});
        if (result) {
            const message = "Job with id: " + req.params.idJob + " was invalidated";
            return res.status(200).json({
                'message': message
            });
        } else {
            const message = "There is no job with this id " + req.params.idJob;
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

const activateJob = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    console.log("validate Job : " + req.params.idJob);
    try {
        const result = await jobService.updateJob(req.params.idJob, {"isValid": true, "state": "validated"});
        if (result) {
            const message = "Job with id: " + req.params.idJob + "activated";
            return res.status(200).json({
                'message': message
            });
        } else {
            const message = "There is no job with this id " + req.params.idJob;
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

const disablePrice = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const result = await jobService.updateJob(req.params.idJob, {"isPriceVisible": false});
        if (result) {
            const message = "the price of the Job with id: " + req.params.idJob + " was disabled";
            return res.status(200).json({
                'message': message
            });
        } else {
            const message = "There is no job with this id " + req.params.idJob;
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

const generatePasswordForUser = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let accountType = req.query.accountType;
    const hash = await bcrypt.genSalt(Number(saltRounds));
    let password = await bcrypt.hash(req.body.password, hash);
    try {
        const result = accountType === 'particular' ? await particularService.updateParticular(req.params.userId, {
                "password": password
            })
            : await companyService.updateCompany(req.params.userId, {
                "password": password
            });
        if (result) {
            if (no_mail === 0) {
                await smsService.send_notification(
                    {
                        "to": result.phoneNumber.value,
                        "message": `Voici votre nouveau mot de passe ${req.body.password}. Pensez à réinitialiser votre de mosse passe sur votre profil sur le bouton reinitialiser mot de passe`
                    }
                );
            }
            const message = "account with id: " + req.params.userId + " has a new password ";
            return res.status(200).json({
                'message': message
            });
        } else {
            const message = "There is no account with this id " + req.params.userId;
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
    getAllAdministrators: getAllAdministrators,
    createAdministrator: createAdministrator,
    deleteAdministrator: deleteAdministrator,
    updateAdministrator: updateAdministrator,
    getAdministratorById: getAdministratorById,
    activateAccount: activateAccount,
    generatePasswordForUser: generatePasswordForUser,
    validateJob: validateJob,
    rejectJob: rejectJob,
    affectJoberToJob: affectJoberToJob,
    changeRole: changeRole,
    invalidateJob: invalidateJob,
    changeMetaFile: changeMetaFile,
    getParticularByName: getParticularByName,
    activateJob: activateJob,
    disablePrice: disablePrice
};
