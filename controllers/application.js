//config
const fs = require('fs');
const path = require('path');
const error_processing = require('../common/utils/error_processing');
const applicationService = require('../services/application');
const notificationService = require('../services/notification');
const jobService = require('../services/job');
const contractService = require('../services/contract');
const employeeStatService = require('../services/statsEmployee');
const particularService = require('../services/particular');
const companyService = require('../services/company');

const _ = require('lodash');
const config = require('../configs/environnement/config');
const no_mail = config.no_mail;
const ADMIN_RIGHTS = require('../common/utils/enum').adminRights;
const smsService = require('../services/sms');
const emailService = require('../services/email_sender');

const getAllApplications = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let level = 1;
    try {
        const limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
        // for route /me/applications
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (req.jwt && intercept.length === 0) {
            req.query.employee = req.jwt.userId;
        } else {    level = 3;} 

        console.log('call of application controller: Get All applications ');
        const applications = await applicationService.getAllApplications(limit, page,req.query, level);
        console.log('there are applications');
        return res.status(200).json({
            'data': applications
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


const getAllFullApplications = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';

    try {
        const limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
        // for route /me/applications
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (req.jwt && intercept.length === 0) {
            req.query.employee = req.jwt.userId;
            level = req.query.level ? req.query.level : 1 ;
            
        }
        // for route /me/applications
        console.log('call of application controller: Get All applications with job information');
        req.query.requestType = "full";
        const applications = await applicationService.getAllApplications(limit, page, req.query, level);
        console.log('there are applications');
        return res.status(200).json({
            'data': applications
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getAllApplicationsFromJob = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
        console.log('call controller for all applications from job id :' + req.params.idJob);
        const applications = await applicationService.getAllApplications(limit, page,
            {job: req.params.idJob, state: {"$nin": ['validated', 'rejected', 'cancelled']}});
        console.log('there are applications for the current job : ' + req.params.idJob);
        console.log(applications);
        return res.status(200).json({
            'data': applications
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const createApplication = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let joberNotification, jobProviderNotification;
    let message;
    let mailLink;
    const mailLinkDev = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
    mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLinkDev;
    try {
        //delete field with default value
        console.log('Call controller create an application ');
        delete req.body.applicationDate;
        delete req.body.state;
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (req.jwt && intercept.length === 0) {
            req.body.employee = req.jwt.userId;
        }

        const application = await applicationService.createApplication(req.body);
        let statEmployee = await employeeStatService.getStatsByUser(req.body.employee);
        await employeeStatService.updateStatsEmployee(req.jwt.userId, {nbApplications: statEmployee.nbApplications + 1});
        message = req.query.lang === 'fr' ? 'Une nouvelle candidature a été crée' : 'new application was created';
        //Notify jober
        let notifUrlJober = '/fr/applications';
        joberNotification = {
            receiver: req.body.employee,
            text: "Votre candidature est en cours d'analyse",
            type_event: "application",
            notifUrl: notifUrlJober
        };
        await notificationService.createNotification(joberNotification);

        //Notify Job Provider
        const job = await jobService.getJob(req.body.job);
        console.log(job);

        if (job) {
            let notifUrl = '/fr/job/' + job._id + '/applications';
            jobProviderNotification = {
                receiver: job.employer,
                text: "Vous avez une nouvelle candidature pour votre job",
                type_event: "application",
                notifUrl: notifUrl
            };
            await notificationService.createNotification(jobProviderNotification)
        }
        console.log("notification sent after creating application");

        const loginLink = mailLink + '/fr/login'

        let employer = job.typeEmployer === 'particular' ?
         await particularService.getParticular("id", job.employer) : 
         await companyService.getCompany("id", job.employer);
         console.log(employer);
        

        let employee = await particularService.getParticular("id", req.body.employee);
        let nameCandidat = employee.name + " " + employee.surname;
        console.log(employee);

        console.log('loginLink : ' + loginLink);

        if(Number(no_mail) === 0){
            console.log("mail will be sent to registered employer : " + employer.email.value)
            if (job.externalContactsJobOffer.isEmployerRegistered || job.externalContactsJobOffer.emails.length === 0) {
                let email = fs.readFileSync(path.join(__dirname, '/../common/mails/application_mail_for_recruiter_fr.html'), 'utf8');
                email = email.replace("#jobTitle", job.title)
                email = email.replace('#name', employer.name + " " + employer.surname);
                mail = email.replace('#NameCandidat', nameCandidat);

                email = email.replace("#cv", application.cv.url)
                email = email.replace("#LM", application.motivations)
                email = email.replace("#diplôme", application.schoolLevel.url)
                email = email.replace("#portfolio", application.portfolio.url)
                email = email.replace("#cardId", application.identityCard.url)
                email = email.replace("#lien", loginLink)
                await emailService.nodemailer_mailgun_sender(
                    {
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": employer.email.value,
                        "subject": `Nouvelle candidature pour votre offre de : ` + job.title,
                        "html": email
                    }
                )
            } else {
                console.log("mail will be sent to scrapped employer contacts : " + job.externalContactsJobOffer.emails)
                let email = fs.readFileSync(path.join(__dirname, '/../common/mails/application_mail_for_no_signed_up_recruiter_fr.html'), 'utf8');
                email = email.replace("#jobTitle", job.title)
                mail = email.replace('#NameCandidat', nameCandidat);

                email = email.replace("#cv", application.cv.url)
                email = email.replace("#LM", application.motivations)
                email = email.replace("#diplôme", application.schoolLevel.url)
                email = email.replace("#portfolio", application.portfolio.url)
                email = email.replace("#cardId", application.identityCard.url)
                email = email.replace("#lien", `${mailLink}/fr/register?email=${job.externalContactsJobOffer.emails[0]}`)
                await emailService.nodemailer_mailgun_sender(
                    {
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": job.externalContactsJobOffer.emails,
                        "subject": `Nouvelle candidature pour votre offre de : ` + job.title,
                        "html": email
                    }
                )
            }
            
        }
        console.log('new application was created');
        return res.status(200).json({
            'message': message,
            'data': application
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const addRequieredFiles = async(body, job , employee) => {

        filesColums= {"cv":"cv.url","identity_card":"identity_card", "driver_permit.url":"driver_permit.url"};

        for (const [file, url] of Object.entries(filesColums)) {
            if(job.required_files[file]){
                body[url]= employee.particulars[0][url] ;
            }
          }
        return body;
}
const createApplicationWithoutAccount = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let joberNotification, jobProviderNotification;
    let message;
    let mailLink;
    const mailLinkDev = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
    mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLinkDev;
    try {
        //delete field with default value
        console.log('Call controller create an application without  '+req.body['email.value']);
        delete req.body.applicationDate;
        delete req.body.state;
        const employee = await  particularService.getAllParticulars(1,0, {"email.value":req.body['email.value']}) ;
        console.log(employee);
        req.body.employee = employee.particulars[0]._id   ;  
        const jobs = await jobService.getAllJobs(1, 0, {slug:req.body['slug']}) ;
        req.body.job = jobs.jobs[0]._id   ;  
        console.log('Call controller create an application without  '+req.body.employee);
        const application = await applicationService.createApplication(req.body);
        let statEmployee = await employeeStatService.getStatsByUser(req.body.employee);
        await employeeStatService.updateStatsEmployee(req.body.employee, {nbApplications: statEmployee.nbApplications + 1});
        message = req.query.lang === 'fr' ? 'Une nouvelle candidature a été crée' : 'new application was created';
        //Notify jober
        let notifUrlJober = '/fr/applications';
        joberNotification = {
            receiver: req.body.employee,
            text: "Votre candidature est en cours d'analyse",
            type_event: "application",
            notifUrl: notifUrlJober
        };
        await notificationService.createNotification(joberNotification);

        //Notify Job Provider
        const job = await jobService.getJob(req.body.job);
        if (job) {
            let notifUrl = '/fr/job/' + job._id + '/applications';
            jobProviderNotification = {
                receiver: job.employer,
                text: "Vous avez une nouvelle candidature pour votre job",
                type_event: "application",
                notifUrl: notifUrl
            };
            await notificationService.createNotification(jobProviderNotification)
        }

        const loginLink = mailLink + '/fr/login'
        console.log(job);
        let employer = job.typeEmployer === 'particular' ?
         await particularService.getParticular("id", job.employer) : 
         await companyService.getCompany("id", job.employer);
         console.log(employer);
        
         console.log('loginLink : ' + loginLink);
        

        if(Number(no_mail) === 0){
            console.log("mail will be sent to registered employer : " + employer.email.value)
            if (job.externalContactsJobOffer.isEmployerRegistered || job.externalContactsJobOffer.emails.length === 0) { //mail sent to employer registered on jobaas
                let email = fs.readFileSync(path.join(__dirname, '/../common/mails/application_mail_for_recruiter_fr.html'), 'utf8');
                email = email.replace("#jobTitle", job.title)
                email = email.replace('#name', employer.name + " " + employer.surname);
                mail = email.replace('#NameCandidat', employee.particulars[0].name + " " + employee.particulars[0].surname);

                email = email.replace("#cv", application.cv.url)
                email = email.replace("#LM", application.motivations)
                email = email.replace("#diplôme", application.schoolLevel.url)
                email = email.replace("#portfolio", application.portfolio.url)
                email = email.replace("#cardId", application.identityCard.url)
                email = email.replace("#lien", loginLink)

                await emailService.nodemailer_mailgun_sender(
                    {
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": employer.email.value,
                        "subject": `Nouvelle candidature pour votre offre de : ` + job.title,
                        "html": email
                    }
                )
            } else { //mail sent to the email scrapped with the other job informations
                console.log("mail will be sent to scrapped employer contacts : " + job.externalContactsJobOffer.emails)
                let email = fs.readFileSync(path.join(__dirname, '/../common/mails/application_mail_for_no_signed_up_recruiter_fr.html'), 'utf8');
                email = email.replace("#jobTitle", job.title)
                mail = email.replace('#NameCandidat', employee.particulars[0].name + " " + employee.particulars[0].surname);

                email = email.replace("#cv", application.cv.url)
                email = email.replace("#LM", application.motivations)
                email = email.replace("#diplôme", application.schoolLevel.url)
                email = email.replace("#portfolio", application.portfolio.url)
                email = email.replace("#cardId", application.identityCard.url)
                email = email.replace("#lien", `${mailLink}/fr/register?email=${job.externalContactsJobOffer.emails[0]}`)
                await emailService.nodemailer_mailgun_sender(
                    {
                        "from": 'Jobaas <no_reply@jobaas.cm>',
                        "to": job.externalContactsJobOffer.emails,
                        "subject": `Nouvelle candidature pour votre offre de : ` + job.title,
                        "html": email
                    }
                )
            }
        }
        console.log('new application was created');
        return res.status(200).json({
            'message': message,
            'data': application
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


const getApplicationById = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const application = await applicationService.getApplication(req.params.idApplication);
        let message;
        if (!application) {
            const err = new error_processing.BusinessError(" ", 404, "classic", req.query.lang, "application");
            return res.status(404).json({
                'message': error_processing.process(err)
            });
        }
        message = req.query.lang === 'fr' ? 'La candidature a été trouvée ' : 'the application found';
        console.log('the application was found by id' + ' : ' + req.params.idApplication);
        return res.status(200).json({
            'message': message,
            'data': application
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getCandidateFromApplicationId = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const application = await applicationService.getCandidateFromApplicationId(req.params.idApplication, req.jwt.userId);
        let message;
        if (!application) {
            message = req.query.lang === "fr" ? 'Candidature non trouvée' : 'Application not found';
            return res.status(404).json({
                'message': message
            });
        }
        message = req.query.lang === "fr" ? 'Candidats trouvés' : 'candidates found';
        console.log('the application found by id : ' + req.params.idApplication);
        return res.status(200).json({
            'message': message,
            'data': application
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const updateApplication = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (req.jwt && intercept.length === 0) {
            req.body.employee = req.jwt.userId;
        }
        delete req.body.state;
        const application = await applicationService.updateApplication(req.params.idApplication, req.body);
        let message;
        if (!application) {
            message = req.query.lang === 'fr' ? "Application introuvable" : "the application not found";
            console.log('the application not found  id : ' + req.params.idApplication);
            return res.status(404).json({
                'message': message
            });
        }
        let job = await jobService.getJob(application.job);
        let notifUrl = '/fr/job/' + application.job + '/applications';
        let joberNotification = {
            "receiver": application.employee,
            "text": "votre candidature pour le job << "+job.title+">> a été mise à jour",
            "type_event": "application",
            "notifUrl": notifUrl
        };
        await notificationService.createNotification(joberNotification);
        message = req.query.lang === 'fr' ? 'La candidature a été mise à jour' : 'the application was updated';
        console.log('the application was updated by id : ' + req.params.idApplication);
        return res.status(200).json({
            'message': message,
            'data': application
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


const cancelApplication = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    try {
        let message;
        const applicationBeforeDelete = await applicationService.getApplication(req.params.idApplication);
        const job = await jobService.getJob(applicationBeforeDelete.job);
        // if the application is already deleted return an error
        message = req.query.lang === "fr" ? "cette candidature a déjà été annulée" : "this  application has already been cancelled";
        if (applicationBeforeDelete.state === "cancelled") {
            return res.status(409).json({
                'message': message
            });
        }
        message = req.query.lang === "fr" ? "Annuler le contrat plutot " : "cancel the contract instead";
        if (applicationBeforeDelete.state === "validated") {
            return res.status(409).json({
                'message': message
            });
        }
        if(applicationBeforeDelete.state === "done"){
            await applicationService.updateApplication(req.params.idApplication, {state: "cancelled"});
            message = req.query.lang === "fr" ? "La candidature a été annulée" : "the application has been cancelled";
            console.log('the application was deleted by id : ' + req.params.idApplication);
            return res.status(200).json({
                'message': message
            });
        }
        const isContractCancelled =  contractService.cancelContract(applicationBeforeDelete, job, lang);
        if (isContractCancelled) {
            message = req.query.lang === "fr" ? "La candidature a été annulée" : "the application has been cancelled";
            console.log('the application was cancelled by id : ' + req.params.idApplication);
            return res.status(200).json({
                'message': message
            });
        } else {
            console.log('no application was found by id : ' + req.params.idApplication);
            const err = new error_processing.BusinessError(" ", 404, "classic", req.query.lang, "application");
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

const markApplicationAsViewed = async (req, res) =>{
    console.log("controller mark as viewed");
    let lang = req.query.lang ? req.query.lang : 'en';
    let applicationId = req.params.idApplication;
    try{
        const application = await applicationService.getApplication(applicationId);
        console.log(application);
        if(application.state ===  "done"){
            await applicationService.updateApplication(applicationId, {"state": "viewed"});
            let jobTitle = await jobService.getJobTitle(application.job);
            let joberNotification = {
                "receiver": application.employee,
                "text": "votre candidature pour l'annonce << " + jobTitle + ">> a été vu par l'employeur",
                "type_event": "application",
                "notifUrl": "/fr/applications"
            };
            await notificationService.createNotification(joberNotification);
            const jobberPhoneNumber = await particularService.getParticularPhoneNumber(application.employee);
            const environment = config.env;
            if(Number(no_mail)===0 && environment !== './dev'){
                let sms = {
                    from: "JOBAAS",
                    to: String(jobberPhoneNumber),
                    text: joberNotification.text
                };
                await smsService.send_notification(sms);
            }
        }else{
            console.log("application id " + applicationId + " Already mark as viewed");
        }
        return res.status(200).json({
            'message': "the application was marked as Viewed"
        });
    }catch(e){
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const deleteApplication = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let message;
        const ApplicationBeforeDelete = await applicationService.deleteApplication(req.params.idApplication);
        // if the application is already deleted return an error
        message = lang === 'fr' ? "cette candidature a déjà été suprrimée" :
            "this  application has already been deleted";
        if (ApplicationBeforeDelete === false) {
            return res.status(409).json({
                'message': message
            });
        } else {
            message = lang === 'fr' ? "Suppression de l'application identifié" :
                "the  application deleted";
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

const  getNbApplicationByEmployee = async(req, res) =>{
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let message;
        const nbApplications = await applicationService.getNbApplicationByEmployee(req.jwt.userId);
        // if the application is already deleted return an error
        message = lang === 'fr' ? "voici le nombre de candidatures de cet employee" :
           "there are the number of applications of this employee";
        return res.status(200).json({
                'data':   nbApplications,
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


module.exports = {
    getAllApplications: getAllApplications,
    getAllFullApplications: getAllFullApplications,
    getAllApplicationsFromJob : getAllApplicationsFromJob,
    createApplication: createApplication,
    createApplicationWithoutAccount:createApplicationWithoutAccount,
    deleteApplication: deleteApplication,
    cancelApplication: cancelApplication,
    updateApplication: updateApplication,
    getApplicationById: getApplicationById,
    getCandidateFromApplicationId: getCandidateFromApplicationId,
    markApplicationAsViewed: markApplicationAsViewed,
    getNbApplicationByEmployee:  getNbApplicationByEmployee
};
