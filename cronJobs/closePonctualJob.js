// libraries
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const logService = require('../services/log');
const jobService = require('../services/job');
// start mongoose connection

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
// this function closes a ponctual job, three days after the endDate
const closePonctualJob = async () => {

    let endDate;
    const startDate = new Date(); // For log
    const startDateLeftLimit = new Date();
    const startDateRightLimit = new Date();
    let filterParamsJobs ;
    let jobClosed = " les Jobs suivants ont été terminés :";
    try {

        let  durationInDays = 3;
        startDateLeftLimit.setDate(startDateLeftLimit.getDate() + durationInDays);
        startDateRightLimit.setDate(startDateLeftLimit.getDate() +  1 );
        startDateLeftLimit.setHours(0, 0, 0, 0);
        startDateRightLimit.setHours(0, 0, 0, 0);
        filterParamsJobs = { state:"validated","frequency.isRegular":false, endDate:{$gte:startDateLeftLimit, $lt:startDateRightLimit}}
        const jobs = await jobService.getAllJobs(0, 0, filterParamsJobs, 1, false);
        console.log("nombre de jobs " + startDateLeftLimit + " and   " + startDateRightLimit + " " + jobs.length);
                // log variables
        const nbSms = 0;
        const nbSmsFails = 0;
        const nbMails = 0;
        // We uptate job status from "validted to completed"
        for (let job of jobs.jobs) {
            jobClosed+= job.title+" " ;
            if(job.nbPlacesLeft === 0) {
               await  jobService.updateJob(job._id,{state:"completed" }) ;
            } else {
               await jobService.updateJob(job._id, {state:"expired"}) ;
            }
        }
        console.log("cronJob  closePonctualJob");
        endDate = new Date();
        const log = {
            "name": "closePonctualJob",
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
            , "info": jobClosed

        };
        await logService.createLog(log);
    } catch (error) {
        console.log(error);
        endDate = new Date();
        const log = {
            "name": "closePonctualJob",
            "status": 1,
            "startDate": startDate,
            "endStart": endDate,
            "error": error
        };
        await logService.createLog(log);
    }
};
// TODO CREATE A TIMER THAT CALL THE PREVIOUS FUNCTIONS
closePonctualJob().then(() => {

    try {

        process.exit(0)

    } catch (error) {
        console.log(error);


    }

});

