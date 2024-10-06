// libraries
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
//services
const particularService = require('../services/particular');
const applicationService = require('../services/application');
const jobService = require('../services/job');
const smsService = require('../services/sms');
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
const recallJobBeforeStartingDay = async (nbApplicationMin = 2) => {
    let durationInDays;
    let jober;
    let dataIn;
    try {
        // we define filter for different resources
        let filterParamsJobs, filterParamsApplications;
        //We define the limit date
        let startDate = new Date();
        durationInDays = 2;
        startDate.setDate(startDate.getDate() + durationInDays);
        let jobsData, applicationsData, message;
        // We define mailLink
        let  mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
        //for   prod host we must add  wwww before the link
        mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
        mailLink += "/fr/applications"
        //we loop on all particulars whom account is valid
        filterParamsJobs = {state: "validated", startDate: {$eq: startDate}};
        jobsData = await jobService.getAllJobs(1, 0, filterParamsJobs, undefined, false);
        for (let job of jobsData.jobs) {
            //we find all the applications
            filterParamsApplications = {job: job._id, state: "validated"}
            applicationsData = await applicationService.getAllApplications(1, 0, filterParamsApplications, false);
            message = applicationsData.length > 0 ? ` <b> ${applicationsData.length}</b>  nouvelles Candidature(s) pour le job <b>${job.title}</b> dans la ville de ${job.town}<br/>` : '';

            for (let application of applicationsData.applications) {
                jober = await particularService.getParticular("id", application.employee);
                // We send the send message  "you would be starting you mission soon
                dataIn = {
                    'text': ` Bonjour ${jober.name},\n  
                            nous tenons à vous rappeler que vous avez une mission (${job.title}) qui commence ${job.startDate} au quartier ${job.street} dans la ville de ${job.town}\nVous pouvez l'annuler en utilisant le lien suivant: ${mailLink} `
                    , 'to': jober.phoneNumber.value
                };
                await smsService.send_notification(dataIn);

            }

        }


    } catch (error) {
        console.log(error);
    }
};


recallJobBeforeStartingDay().then(() => {
    mongoose.connection.close()
});
