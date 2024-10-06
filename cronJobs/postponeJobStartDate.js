// libraries
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const logService = require('../services/log');
const particularService = require('../services/particular');
const jobService = require('../services/job');
const email_sender = require('../services/email_sender');
// start mongoose connection
const no_mail =  0 //config.no_mail;
const no_sms =  config.no_sms;
const  marketing_mails= config.marketing_mails;

mongoose.connect(config.databaseUri, {
    connectTimeoutMS: 1500,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // sets the delay between every retry (milliseconds)

}).then(
    () => {
        console.log('connected to ' + config.databaseUri);
    });

console.log("before function call");
// this function Generate the new jobs summary
const postponeJobStartDate = async () => {
    var startDate = new Date();
    const day = startDate.getDay() ;

    var startDateLeftLimit = new Date();
    var startDateRightLimit = new Date();
    const postposteDurationInDays = 7;
    let nbJobPostponed = 0;
    let jobPostponed = " les dates de débuts des jobs suivants ont été repoussées d'une semaine :";
    // log variables
    var status;
    var nbSms = 0;
    var nbSmsFails = 0;
    var nbMails = 0;
    var smsStatus;
    try {

        let joberNotification, durationInDays = 1
        startDateLeftLimit.setDate(startDateLeftLimit.getDate() + durationInDays);
        startDateRightLimit.setDate(startDateLeftLimit.getDate() + durationInDays);
        var jobers = await particularService.getAllParticulars(0, 0, {state: "employee"}, false);
        //{startDate:startDateLimit, nbPlacesLeft:{$ne:0}, state:"validated" }
        startDateLeftLimit.setHours(0, 0, 0, 0);
        startDateRightLimit.setHours(0, 0, 0, 0);
        var jobs = await jobService.getAllJobs(0, 0, {
            startDate: {$gte: startDateLeftLimit, $lt: startDateRightLimit},
            nbPlacesLeft: {$ne: 0},
            state: "validated"
        }, 0, false);
        console.log("nombre de jobs " + startDateLeftLimit + " and   " + startDateRightLimit + " " + jobs.length)
        // We postpone the startDate to one week
        //TODO REPLACE loop with an updateMany query
        // TODO notify jober
        for (let job of jobs.jobs) {
            console.log(" startDate " + job.startDate + "  endDate " + job.endDate)
            // add
            job.startDate.setDate(job.startDate.getDate() + postposteDurationInDays)
            job.endDate.setDate(job.endDate.getDate() + postposteDurationInDays)
            console.log("après  startDate " + job.startDate + "  endDate " + job.endDate)
            await jobService.updateJob(job._id, {startDate: job.startDate, endDate: job.endDate})
            nbJobPostponed++;
            jobPostponed += job.title + " "

        }

        // We define mailLink
        mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
        //for   prod host we must add  wwww before the link
        mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
        const rootUrl = mailLink
        mailLink += "/fr/jobs"
        console.log("cronJob  postponeJobStartDate "+nbJobPostponed );
        if (Number(no_mail) === 0 &&   nbJobPostponed > 0 ) {
                
            await email_sender.nodemailer_mailgun_sender({
                "from": 'Jobaas <info@jobaas.cm>',
                "to": marketing_mails, "cc": "", "bcc": "",
                "subject": "report "+nbJobPostponed+" Jobs ",
                "html": jobPostponed,
                "text": ''
            });
        }

        var endDate = new Date();
        const log = {
            "name": "postponeJobStartDate",
            "status": "0",
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
                    success: nbMails,
                    fails: 0
                },
            }
            , "info": jobPostponed

        }
        await logService.createLog(log);
    } catch (error) {
        console.log(error);
        var endDate = new Date();
        const log = {
            "name": "postponeJobStartDate",
            "status": 1,
            "startDate": startDate,
            "endStart": endDate,
            "error": error
        }
        await logService.createLog(log);


    }
};
// TODO CREATE A TIMER THAT CALL THE PREVIOUS FUNCTIONS
postponeJobStartDate().then(() => {

    try {

        process.exit(0)

    } catch (error) {
        console.log(error);


    }

});

