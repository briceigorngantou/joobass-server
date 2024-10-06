// libraries
const jobService = require('../services/job');
const email_sender = require('../services/email_sender');
const notificationService = require('../services/notification');
const administratorService = require('../services/administrator');

// this function recall that find jober for those that ain't fullfilled.
const recallJobNotFullFill = async() => {
    try {
        var startDate = new Date()
        var durationInDays = 3;
        startDate.setDate(startDate.getDate() + durationInDays);
        //get all the jobs that will start within 3 days
        var jobs = jobService.getAllJobs(0, 0, {startDate: startDate}, 0, false)
        //We notify all controllers
        const controllers = await administratorService.getAllAdministrators(0, 0, {"state": "controller"}, false);
        var message;
        for (let job of jobs) {
            //We clear the mail variable
            mail = "";
            jobsCount = 0;
            message = ` vous devez proposer des candidature pour le job  ${job.id}  qui débute dans moins de 3 jours`;
            for (let controller of controllers) {
                ControllerNotification = {
                    receiver: controller._id,
                    text: message,
                    typeEvent: "job",
                    notifUrl: "à définir "
                };
                await notificationService.createNotification(ControllerNotification);
            }

        }

    } catch (error) {
        console.log(error);
    }
};
