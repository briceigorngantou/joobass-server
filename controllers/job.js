const jobService = require('../services/job');
const applicationService = require('../services/application');
const notificationService = require('../services/notification');
const StatsEmployerService = require('../services/statsEmployer');
const error_processing = require('../common/utils/error_processing');
const employerStatService = require('../services/statsEmployer');
const contractService = require('../services/contract');
const locationService = require('../services/location');
const administratorService = require('../services/administrator');
const transactionService = require('../services/transaction');
const emailService = require('../services/email_sender');
const _ = require('lodash');
const path = require('path');
const ADMIN_RIGHTS = require('../common/utils/enum').adminRights;
const ENTREPRISE_USER = require('../configs/environnement/config').permissionLevels.ENTREPRISE_USER;
const PAYMENT_TYPE_FEES = require('../configs/environnement/config').payment_type_fees;
const rhPackLevelType = require('../common/utils/enum').rhPackLevelType;
const config = require('../configs/environnement/config');
const {getPack} = require("../services/pack");
const {computePrice} = require("../common/utils/processing");
const {packLevelTypeWithoutFirst} = require("../common/utils/enum");
const no_mail = config.no_mail;
const marketing_mails = config.marketing_mails;
const ressource = path.basename(__filename, '.js');

const getAllJobs = async (req, res) => {
    let lang;
    try {
        const limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let preview = req.query.preview ? req.query.preview : false;
        let level = req.query.level  ? parseInt(req.query.level) : 1;
        let page = 0;
        if (req.query) {
            if (req.query.page) {
                req.query.page = parseInt(req.query.page);
                page = Number.isInteger(req.query.page) ? req.query.page : 0;
            }
        }
        //  non admin and non controller can only see validated job
        let jobs;
        let tmp = [];
        let result;
        if (!req.jwt || level === 0) {
            console.log('no connected user or employee user');
            jobs = await jobService.getAllJobs(limit, page, req.query, level, true, preview);
            for (let i = 0; i < jobs.jobs.length; i++) {
                const infosJob = preview === "true" ? null : await jobService.getEmployerName(jobs.jobs[i]._id);
                const employerName = preview === "true" ? null : infosJob.name;
                tmp.push({"infoJob": jobs.jobs[i], "employer": employerName});
            }
            result = {"jobs": tmp, "length": jobs.length};
        } else {
            let fieldList = '';
            console.log("user "+req.jwt.userId+" call get all jobs controller");
            const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
            if (intercept.length === 0) {
                req.query.employer = req.jwt.userId;
            }
            if(req.query.fieldList && level !==0 ){
                fieldList = JSON.parse(req.query.fieldList.replace(/'/g, '"') );
            }
            result = await jobService.getAllJobs(limit, page, req.query, level,true, preview,  fieldList);
        }
        return res.status(200).json({
            'data': result
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getJobPaymentState = async(req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        let state = await jobService.getJobPaymentState(req.params.idJob);
        message = lang ? "voici l'état de paiement de ce job" : "There is the state of the payment of the current Job";
        console.log("There is the state of the payment of the current Job: " + req.params.idJob);
        return res.status(200).json({
            'message': message,
            'data': state
        });
    } catch (e) {
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getJobBySlug = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let userView = req.query.userView ? req.query.userView : true;
    let message;
    try {
        let job = await jobService.getJobBySlug(req.params.slug);
        if (!job) {
            message = lang === 'fr' ? "Aucun job n'a été trouvé" : 'Job not found';
            console.log('job not found');
            return res.status(404).json({
                'message': message
            });
        }
        if(userView){
            job = await jobService.updateJob(job._id, {"nbViews": job.nbViews + 1});
        }
        if(req.jwt  && req.jwt.userId){
            console.log("req.jwt.userId "+req.jwt.userId) ;
            await jobService.updateJobViews(job._id,{idViewer:req.jwt.userId});
        }
        message = lang === 'fr' ? "Le job a été trouvé par le slug " + req.params.slug : 'the job found by slug : ' + req.params.slug;
        const infosJob = await jobService.getEmployerName(job._id);
        console.log('the job found by slug : ' + req.params.slug);
        return res.status(200).json({
            'data': {"job": job, "infos": infosJob},
            "message": message
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const createJob = async (req, res) => {
    console.log("Create Job Controller");
    let message;
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        if (!req.body.sourceJobOffers){
            console.log("Starting the publication of a normal job offer - published by jobaas team or user");
            //We set the body to specify the source details of the job offer
            req.body.sourceJobOffers = {
                typeSourceJobOffer:  "users",
                nameSourceJobOffer: "jobaas.cm"
                
            }
            //delete field with default value
            delete req.body.registrationDate ;
            delete req.body.state;
            delete req.body.isValid;
            delete req.body.nbPlacesLeft;
            //check endDate greater than startedDat
            const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
            console.log("checking the rights of the emitter to see if it's an admin who is publishing")
            if (req.jwt && intercept.length === 0) {
                req.body.employer = req.jwt.userId;
                if (req.jwt.permissionLevel.includes(ENTREPRISE_USER)) {
                    req.body.typeEmployer = 'entreprise';
                }
            }
            const pack = await getPack(req.body.packLevelId);
            if(pack.level.levelType === "One"){
                req.body.state = "validated";
                req.body.isValid = true;
                req.body.feesPaid = true;
                req.body.insuranceChecked = true;
            }
            let statEmployer = await StatsEmployerService.getStatsByUser(req.body.employer);
            //updated
            if (statEmployer) {
                await StatsEmployerService.updateStatsEmployer(req.body.employer, {nbJobCreated: statEmployer.nbJobCreated + 1})
            }
            if (Date.parse(req.body.startDate) > Date.parse(req.body.endDate)) {
                let err = new error_processing.BusinessError("endDate can't be lower than startDate",
                    "La date de fin ne pas être inférieure à la date de début", 405,
                    "business", req.query.lang);
                return res.status(err.code).json({
                    'message': error_processing.process(err)
                });
            } else if (req.body.frequency.isRegular === false) {
                console.log("checking that the date filled to published the jobs are valid")
                let valid = (date) => Date.parse(date.day) >= Date.parse(req.body.startDate) && Date.parse(date.day) <= Date.parse(req.body.endDate);
                if (!req.body.frequency.listOfDates.every(valid) && req.body.frequency.listOfDates.length > 0) {
                    let err = new error_processing.BusinessError("All dates of work need to be between start date and end date",
                        "Toutes les dates de mission doivent être comprises entre la date de début et la date de fin", 400,
                        "business", req.query.lang);
                    return res.status(err.code).json({
                        'message': error_processing.process(err)
                    });
                }
            }
            if (req.body.locationPlaceId) {
                const geoLocation = await locationService.getLocationByPlaceId(req.body.locationPlaceId);
                req.body.geo_coordinates = {
                    "longitude": geoLocation.location.long,
                    "latitude": geoLocation.location.lat
                };
                delete req.body.locationPlaceId;
            }
            req.body.employerPayment = computePrice(pack.level.levelType,
                req.body.nbplaces, req.body.insuranceChecked, pack.price, PAYMENT_TYPE_FEES,
                pack.insurance.insurancePrice);
            const job = await jobService.createJob(req.body);

            if(pack.level.levelType === "One"){
                await transactionService.createTransaction({
                    "emitter": req.body.employer,
                    "job": job.id,
                    "idCharge": "action manuelle",
                    "payment": 0,
                    "type": "fees",
                    "state": "validated"
                });
            }
            let mailLink;
            // We define mailLink
            mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
            //for   prod host we must add  wwww before the link
            mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink ;
            mailLink = mailLink+"/fr/job/"+job.id;
            const interceptWithRhPackLevelType = _.intersectionWith([pack.level.levelType], rhPackLevelType);
            console.log("checking that the job offer pricing is relevant with sending an email to different jobaas teams");
            if(interceptWithRhPackLevelType.length !== 0){
                if (Number(no_mail) === 0) {
                    await emailService.nodemailer_mailgun_sender({
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": "recrutement@jobaas.cm",
                        "subject": ` [${config.env}] Demande de suivi RH pour cette mission ${job.id}`,
                        "html": `La mission avec l'id ${job.id} nécessite un suivi RH <br>Lien pour la consultation ${mailLink}`
                    });
                }
            }
            const interceptWithMarketingPackLevelType = _.intersectionWith([pack.level.levelType], packLevelTypeWithoutFirst);
            console.log("checking that the job offer pricing is relevant with sending an email to different jobaas teams");
            if(interceptWithMarketingPackLevelType.length !== 0){
                if (Number(no_mail) === 0) {
                    await emailService.nodemailer_mailgun_sender({
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": marketing_mails,
                        "subject": ` [${config.env}] Demande de validation de la mission ${job.id}`,
                        "html": `la mission avec l'id ${job.id} est en attente de validation <br>Lien pour la consultation ${mailLink}`
                    });
                    await emailService.nodemailer_mailgun_sender({
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": ['louisadji@gmail.com','leonelelanga@yahoo.fr', 'cto@jobaas.cm', 'info@jobaas.cm', 'annick.bakot@gmail.com'],
                        "subject": ` [${config.env}] Demande d'actions pour cette mission ${job.id}`,
                        "html": `La mission avec l'id ${job.id} des affiches en Marketing - Com.  <br>Lien pour la consultation ${mailLink}`
                    });
                }
            }
            message = lang === 'fr' ? 'Nouveau job créé ' : 'new job was created';
            console.log('new job was created : ' + job.id);
            return res.status(200).json({
                'message': message,
                'data': job,
            });
        } else {
            console.log("Starting to publish a scrapped job offer");
            console.log(req.body);
            if (req.body.externalContactsJobOffer.emails.length > 0 && req.body.externalContactsJobOffer.emails!==[""]) {
                let rights_admin = _.intersectionWith([req.jwt.email.value], ["philippe.adiaba@jobaas.cm", "jordanet@jobaas.cm"]);
                console.log("checking that the scrapped job offer is published by a valid script written by jobaas it team members");
                if (rights_admin.length === 0) {
                    message = lang === 'fr' ? "Seul un scrapper de philippe adiaba en prod ou de Jordan Tsafack ailleurs peut créer une offre d'emploi scrappée depuis un autre site" : "Only a philippe adiaba's or Jordan Tsafack scrapper can publish a scrapped job offer";
                    console.log('Scrapped job was not created because the request was not issued by a granted admin');
                    return res.status(403).json({
                        'message': message,
                    });
                }
                //We set the old parameters to default values. The jobs published here are published by admin with email philippe.adiaba@jobaas.cm for a company jobaasScrapper
                //  if we are in production any other admin account if we are not in production
    
                //add env variables to set up the id of the employer for these scrapped job offer. A company JobaasScrapper in production and global.idprovider in local and env tests
                req.body.packLevelId = '63e92baead803489b823758b';
                req.body.state = "validated";
                req.body.isValid = true;
                req.body.feesPaid = true;
                req.body.cv_required = true;
                req.body.insuranceChecked = true;
                req.body.employerPayment = 0;
                let potential_duplicate = await jobService.getJobBySlug(req.body.slug);
                if (potential_duplicate) {
                    console.log("This scrapped job already exists : " + potential_duplicate);
                    message = lang === 'fr' ? 'Job non crée par job scrapping car un slug identique existe déjà' : 'No new job created by scrapping as a slug wth same value already exists';
                    return res.status(500).json({
                        'message': message
                    })
                }
                const job = await jobService.createJob(req.body);
                message = lang === 'fr' ? 'Nouveau job créé par scrapping' : 'new job was created with scrapping';
                console.log('new job was created : ' + job.id);
                return res.status(200).json({
                    'message': message,
                    'data': job,
                });
            } else {
                message = lang === 'fr' ? "Offre d'emploi non ajoutée à la base car aucune adresse mail n'est présente en description" : 'Job offer failed to be created because no email was available in the scrapped data';
                return res.status(500).json({
                    'message': message,
                });
            }
            
        }
        
    } catch (e) {
        if (Number(no_mail === 0)) {
            let currentJob = JSON.stringify(req.body);
            await emailService.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": ['leonelelanga@yahoo.fr', 'cto@jobaas.cm'],
                "subject": `[${config.env}]Erreur Backend pour la création d'une annonce`,
                "html": `${e.message} \n ${currentJob}`
            });
        }
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getJobById = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let userView = req.query.userView ? req.query.userView : true;
    let  infosJob;
    let message;
    try {
        let job = await jobService.getJob(req.params.idJob);
        if (!job) {
            message = lang === 'fr' ? "Aucun job n'a été trouvé" : 'Job not found';
            console.log('job not found');
            return res.status(404).json({
                'message': message
            });
        }
        if(userView){
            job = await jobService.updateJob(req.params.idJob, {"nbViews": job.nbViews + 1});
        }
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (intercept.length === 1) {
            infosJob = await jobService.getEmployerDetail(job.employer);
        } else {
            infosJob = await jobService.getEmployerName(req.params.idJob);
        }

        console.log('the job found by id : ' + req.params.idJob);
        return res.status(200).json({
            'data': {"job": job, "infos": infosJob}
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const appendJobView = async (req, res, next) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        let job = await jobService.getJob(req.params.idJob);
        if (!job) {
            message = lang === 'fr' ? "Aucun job n'a été trouvé" : 'Job not found';
            console.log('job not found');
            return res.status(404).json({
                'message': message
            });
        }
        if(req.jwt  && req.jwt.userId){
            console.log("req.jwt.userId "+req.jwt.userId) ;
            await jobService.updateJobViews(req.params.idJob,{idViewer:req.jwt.userId});
        }
        next();
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


const updateJob = async (req, res) => {
    console.log('Call Update Job controller');
    let lang = req.query.lang ? req.query.lang : 'en';
    delete req.body.state;
    if (req.body.nbPlacesLeft) {
        delete req.body.nbPlacesLeft;
    }
    try {
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (req.body.state && intercept.length === 0) {
            console.log('you are not allowed to change the state : ' + req.params.idJob);
            return res.status(403).json({
                'message': 'You are not allowed to change the state'
            });
        }
        const job = await jobService.updateJob(req.params.idJob, req.body);
        let message;
        if (!job) {
            message = error_processing.generateResponse(ressource, req.params.idJob, "update", 404, req.query.lang);
            return res.status(404).json({
                'message': message
            });
        }
        message = error_processing.generateResponse(ressource, req.params.idJob, "update", 200, req.query.lang);
        //TODO DISCUSS ABOUT THIS; WE CANNOT DO THIS IN CONTROLLER BUT IN CRON JOB
        //TODO DECIDE WHAT FIELD CAN BE MODIFIED BY THE USER
        let employees = await applicationService.getValidatedJobsApplications(req.params.idJob);
        for (let employee of employees) {
            await notificationService.createNotification({
                "receiver": employee.employee._id,
                "text": "Il y a du nouveau pour le job " + job.title + " pour lequel votre candidature a été retenue",
                "type_event": "rappel_job",
                "notifUrl": "/fr/job/" + job._id
            })
        }
        console.log('the job was updated by id : ' + req.params.idJob);
        return res.status(200).json({
            'message': message,
            'data': job,
        });
    } catch (e) {
        if (Number(no_mail === 0)) {
            let currentJob = JSON.stringify(req.body);
            await emailService.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": ['leonelelanga@yahoo.fr', 'cto@jobaas.cm'],
                "subject": `[${config.env}]Erreur Backend pour la modification d'une annonce`,
                "html": `${e.message} \n ${currentJob}`
            });
        }
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const cancelJob = async (req, res) => {
    let message;
    console.log("Cancel Job Controller")
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const jobBeforeDelete = await jobService.getJob(req.params.idJob);
        // if the job is already deleted return an error
        message = lang === "fr" ? "ce job  a déjà été annulé" : "this job has already been cancelled";
        // check the current job's state
        if (jobBeforeDelete.state === "cancelled") {
            return res.status(409).json({
                'message': message
            });
        }
        const job = await jobService.updateJob(req.params.idJob, {"state": "cancelled"});
        if (job) {
            //TODO   Notifiy all jobers that this job has been deleted
            //TODO OPTIMIZE ALERTS TO ADMIN
            const controllers = await administratorService.getAllAdministrators(0, 0, {}, false);
            let ControllerNotification;
            for (let controller of controllers.administrators) {
                ControllerNotification = {
                    receiver: controller._id,
                    text: " the  job with the title " + job.title + " has been cancelled",
                    type_event: "cancel_job",
                    notifUrl: "/fr/job/" + job._id
                };
                await notificationService.createNotification(ControllerNotification);
            }
            // We update stats
            const statsUser = await employerStatService.getStatsByUser(job.employer);
            if (statsUser) {
                await employerStatService.updateStatsEmployer(job.employer, {nbJobDeleted: statsUser.nbJobDeleted + 1});
            }
            message = req.query.lang === "fr" ? "Suppression du job " : "the job was deleted";
            return res.status(200).json({
                'message': message
            });
        } else {
            message = req.query.lang === "fr" ? "Aucun job n'a été trouvé" : 'no job was found';
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

const deleteJob = async (req, res) => {
    let message;
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const job = await jobService.getJob(req.params.idJob);
        if (job) {
            //TODO   Notifiy all jobers that this job has been deleted
            //TODO OPTIMIZE ALERTS TO ADMIN
            const controllers = await administratorService.getAllAdministrators(0, 0, {}, false);
            let ControllerNotification;
            for (let controller of controllers.administrators) {
                ControllerNotification = {
                    receiver: controller._id,
                    text: " the  job with the title " + job.title + " has been deleted",
                    type_event: "cancel_job",
                    notifUrl: "/fr/job/" + job._id
                };
                await notificationService.createNotification(ControllerNotification);
            }
            // We cancel the current contracts with employee 
            if (job.state === "validated") {
                const currentContract = await contractService.getContractByJob(req.params.idJob);
                await contractService.updateContract(currentContract._id, {
                    'state': 'failed'
                });
            }
            // We update stats
            const statsUser = await employerStatService.getStatsByUser(job.employer);
            if (statsUser && job.state === "validated") {
                await employerStatService.updateStatsEmployer(job.employer, {nbJobValidated: statsUser.nbJobValidated - 1,nbJobDeleted: statsUser.nbJobDeleted + 1});
            } else{
               
                await employerStatService.updateStatsEmployer(job.employer, {nbJobCreated: statsUser.nbJobCreated - 1});
            }
            message = req.query.lang === "fr" ? "Suppression du job " : "the job was deleted";
            return res.status(200).json({
                'message': message
            });
        }

        const jobBeforeDelete = await jobService.deleteJob(req.params.idJob);
        // if the job is already deleted return an error
        message = req.query.lang === "fr" ? "le job ayant pour id : " + req.params.idJob + " a déjà été supprimé " : "the job identified by id : " + req.params.idJob + " has already been deleted";
        // check the current job's state
        if (jobBeforeDelete === false) {
            return res.status(409).json({
                'message': message
            });
        } else {
            message = req.query.lang === "fr" ? "le job ayant pour id : " + req.params.idJob + " a  été supprimé " : message = 'the job identified by id : ' + req.params.idJob + " has  been deleted";
            return res.status(200).json({
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

const getHiredEmployees = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        let tmp = [];
        let employees = await jobService.getHiredEmployees(req.params.idJob);
        for (let employee of employees) {
            const nbTransactions = await transactionService.getNbTransactionByJobByEmployee(req.params.idJob, employee.employee._id);
            tmp.push({"employee": employee, "nbTransactionsTodo": nbTransactions});
        }
        let count = tmp.length;
        message = lang ? "Voici les candidats embauchés pour ce job "
            : "Here we get the employees hired for this job";
        console.log("Here we get the employees hired for the jobId : " + req.params.idJob);
        return res.status(200).json({
            'message': message,
            'data': {"employees": tmp, "length": count}
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getValidatedJobsApplicationByEmployee = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        let jobs = await applicationService.getValidatedJobsApplicationsByEmployee(req.params.idUser);
        let count = jobs.length;
        message = lang ? "Voici les contrats de cet user" : "There contracts of the current user";
        console.log("Here we get the contracts of the user : " + req.params.idUser);
        return res.status(200).json({
            'message': message,
            'data': {"jobs": jobs, "length": count}
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getNbApplicationsByJob = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        let count = await applicationService.getNbApplicationByJob(req.params.idJob);
        message = lang ? "voici le nombre de candidatures par job" : "There is the number of applications for this job";
        console.log("There is the number of applications for this job : " + req.params.idJob);
        return res.status(200).json({
            'message': message,
            'data': count
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


//job done
const jobDone = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let  message ;
  try {
   const jobBeforeUpadte = await jobService.getJob(req.params.idJob);
   if (jobBeforeUpadte.state === "completed" ){
        message = lang === "en" ? "This job is already completed":" cette mission est déjà terminée"
   }
   const job = await jobService.updateJob(req.params.idJob, {state: "completed"});
      const joberNotification = {
          receiver: job.employer,
          text: "Merci d'avoir choisi votre candidat sur Jobaas pour l'annonce " + job.title,
          type_event:"job_done",
          notifUrl: `/fr/job/${req.params.idJob}`
      };
    await notificationService.createNotification(joberNotification);
     message =   lang ==="en" ? "We thank you for your confirmation":"Nous vous remercions pour votre confirmation";
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


const getAllJobLocation = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let streets = await jobService.getAllJobLocation();
        return res.status(200).json({
            'data': {"streets": streets}
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getEstimationEmployerPayment= async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let employerPayment = computePrice(req.body.levelType, req.body.nbPeople,
            req.body.insuranceChecked, req.body.fees, PAYMENT_TYPE_FEES, req.body.insurancePrice);
        const priceEuro = Number(employerPayment/650).toFixed(2);
        return res.status(200).json({
            'data': {"priceXAF": employerPayment, "priceEuro": priceEuro}
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
    getAllJobs: getAllJobs,
    createJob: createJob,
    deleteJob: deleteJob,
    cancelJob: cancelJob,
    updateJob: updateJob,
    getJobById: getJobById,
    getHiredEmployees: getHiredEmployees,
    getAllJobLocation: getAllJobLocation,
    jobDone: jobDone,
    appendJobView:appendJobView,
    getJobBySlug: getJobBySlug,
    getEstimationEmployerPayment: getEstimationEmployerPayment,
    getValidatedJobsApplicationByEmployee: getValidatedJobsApplicationByEmployee,
    getNbApplicationsByJob: getNbApplicationsByJob,
    getJobPaymentState: getJobPaymentState
};
