
//services
const particularService = require('../services/particular');
const jobService = require('../services/job');


// this function remind job provider they should evaluate the jober
const recallForEvaluation = async () => {
    let ControllerNotification;
    try {
        const startDate = new Date();
        const durationInDays = 3;
        startDate.setDate(startDate.getDate() - durationInDays);
        //get all the jobs that will start within 3 days
        const jobs = jobService.getAllJobs(0, 0, {endDate: startDate}, {state: 'validated'}, 1, false);
        //We notify the job provider          -
        let message, jobProvider;
        for (let job of jobs) {
            jobProvider = await particularService.getParticular("employer", job.employer);
            message = ` vous devez évaluer  les jobeurs et mettre le statut du job à done`;
            ControllerNotification = {
                receiver: jobProvider._id,
                text: message,
                typeEvent: "job",
                notifUrl: "à définir "
            };
            await notificationService.createNotification(ControllerNotification);
            // TO DO SEND MAIL

        }

    } catch (error) {
        console.log(error);

    }
};
// libraries
const fs = require('fs');
const path = require('path');
//services
const particularService = require('../services/particular');
const email_sender = require('../services/email_sender');
const notificationService = require('../services/notification');
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const crypto_string = require('crypto-random-string');
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
const recallIdentityForDocuments = async () => {
    let no_mail;
    let validationToken;
    try {
        console.log(`cronJob  recallIdentityForDocuments`);
        let filterParams;
        filterParams = {"identityCard.valid": false};
        no_mail = 0;
        let particulars = await particularService.getAllParticulars(1, 0, filterParams, false);
        validationToken = {'token': crypto_string({length: 32}), 'date': Date.now()};
        for (let particular of particulars.particulars) {
            let mailLink;
            if (config.env === './dev') {
                mailLink = 'http://' + config.hostname + ':' + config.port;
            } else {
                mailLink = 'https://' + config.hostname;
            }
            mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
            console.log('mailLink : ' + mailLink + ' hostname : ' + config.hostname);
            const apiLink = mailLink + '/api/v1/particular/' + particular._id + '/verify_account?token=' + validationToken.token;
            console.log('apiLink : ' + apiLink);
            let email = fs.readFileSync(path.join(__dirname, '/../common/mails/recallIdentityForDocuments_fr.html'), 'utf8');
            email = email.replace('#name', particular.name);
            email = email.replace(/#lien/g, apiLink);
            // console.log(email);
            //TO DO PUT DEV AFTER
            if (Number(no_mail) === 0) {
                console.log('after the no mail condition');
                await email_sender.nodemailer_mailgun_sender({
                    "from": 'Jobaas  <no_reply@jobaas.cm>',
                    "to": particular.email.value,
                    "subject": "Rappel pièces d'identité à enovyer",
                    "html": email
                });
            }
        }
    } catch (error) {
        console.log(error.message);

    }
};

recallIdentityForDocuments().then(() => {
    mongoose.connection.close();
});
