// libraries
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const logService = require('../services/log');
const applicationService = require('../services/application');
const jobService = require('../services/job');
const notificationService = require('../services/notification');

// start mongoose connection
mongoose.connect(config.databaseUri, {
    connectTimeoutMS: 1500,
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(
    () => {
        console.log('connected to ' + config.databaseUri);
    });
// this function recall that find jober for those that ain't fullfilled.
const rejectApplicationsInDeathLine = async (nbApplicationMin = 2) => {
    const startDate = new Date();
    const  durationInDays = 31*2
    let lowerDate = new Date().setDate(startDate.getDate() - durationInDays) ;

    try {
        // we define filter for different resources
        let filterParamsJobs, filterParamsApplications;
        let jobsData, applicationsData, message, joberNotification;
        // log variables
        let nbdNotications = 0;
        let nbSms = 0, nbSmsFails = 0;
        nbSmsFails = 0;
        const nbMails = 0;

        filterParamsJobs = {"state": {$ne:"rejected"}};
        jobsData = await jobService.getAllJobs(100, 0, filterParamsJobs, 1, false);
        console.log(jobsData.length + " jobs found");
        for (let job of jobsData.jobs) {

            console.log("id " + job._id);
            //we find all the applications
            filterParamsApplications = { state: "done", applicationDate : {$lte: lowerDate}, "job": job._id};
            applicationsData = await applicationService.getAllApplications(1, 0, filterParamsApplications, false);
            //WE RECJECT ALL  Applications
            console.log(applicationsData.length + " applications found");
            
            for (let application of applicationsData.applications) {
                await applicationService.updateApplication(application._id, {"state": "rejected", "reason":"Désolé votre candidature a été  rejeté pour le poste de  " + job.title + " car l'employeur a déjà validé des employés pour ce job."})
                joberNotification = {
                    receiver: application.employee,
                    text: "Désolé votre candidature a été  rejeté pour le poste de  " + job.title + " car l'employeur a déjà validé des employés pour ce job.",
                    type_event: "reject_application",
                    notifUrl: `/fr/application/${application._id}`
                };
                nbdNotications++;
                await notificationService.createNotification(joberNotification);
            }
            
        }
        

        var endDate = new Date();
        const log = {
            "name": "rejectApplicationsInDeathLine",
            "status": 0,
            "startDate": startDate,
            "endStart": endDate,

            sends: {
                sms: {
                    success: nbSms,
                    fails: nbSmsFails
                },
                emails: {
                    success: nbMails,
                    fails: 0
                },
                notfications: {
                    success: nbdNotications,
                    fails: 0
                },
            }


        }
        await logService.createLog(log);


    } catch (error) {
        console.log(error);

        var endDate = new Date();
        const log = {
            "name": "rejectApplicationsInDeathLine",
            "status": 1,
            "startDate": startDate,
            "endStart": endDate,
            "error": error
        }
        await logService.createLog(log);

    }
};


rejectApplicationsInDeathLine().then(() => {
    process.exit(0)
});
