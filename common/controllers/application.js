// services
const error_processing = require('../utils/error_processing');
const particularService = require('../../services/particular');
const companyService = require('../../services/company');
const applicationService = require('../../services/application');
const jobService = require('../../services/job');
const employeeStatService = require('../../services/statsEmployee');
const contractService = require('../../services/contract');
const smsService = require('../../services/sms');
const ADMIN_RIGHTS = require('../utils/enum').adminRights;
const notificationService = require('../../services/notification');
const _ = require('lodash');

//configs
const config = require('../../configs/environnement/config');
const no_mail = config.no_mail;

// validate or reject an application by job provider
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

module.exports = {
    appreciateApplication:appreciateApplication
};
