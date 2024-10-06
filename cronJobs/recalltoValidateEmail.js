// libraries
const fs = require('fs');
const path = require('path');
//services
const particularService = require('../services/particular');
const email_sender = require('../services/email_sender');
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
const recallJtoValidateEmail = async () => {
    let no_mail;
    try {
        console.log(" cron job recallJtoValidateEmail");
        let filterParams;
        filterParams = {"email.valid": false};
        no_mail = config.no_mail;
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
            let email = fs.readFileSync(path.join(__dirname, '/../common/mails/registration_fr.html'), 'utf8');
            email = email.replace('#name', particular.name);
            email = email.replace(/#lien/g, apiLink);
            // console.log(email);
            //TO DO PUT DEV AFTER
            if (Number(no_mail) === 0) {
                console.log('after the no mail condition');
                email_sender.nodemailer_mailgun_sender({
                    "from": '"Jobaas " <no_reply@jobaas.cm>',
                    "to": particular.email.value,
                    "subject": 'Confirmation inscription Jobaas',
                    "html": email
                });
            }
        }

    } catch (error) {
        console.log(error);

    }
};

recallJtoValidateEmail().then(() => {
    mongoose.connection.close()
});
