const config = require('../configs/environnement/config');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(config.mailgun_apikey);
// The service_mail function will need an object attachment like defined the line before if you want to sent a file in attachment
const service_mail = async function (dataIn, attachments = []) {
    console.log('call service email');
    let result = false;
    const msg = {
        from: dataIn['from'],
        to: dataIn['to'], // An array if you have multiple recipients. Pour l'instant cet adresse, avec un nom de domaine le champ to dans dataIn
        subject: dataIn['subject'],
        // You can use "html:" to send HTML email content. It's magic!
        html: dataIn['html'],
        attachments: attachments,
    };

    await sgMail.send(msg)
        .then(() => {
            result = true;
            console.log('Email sent')
        })
        .catch((error) => {
            console.error(error)
        });

    return result;
};

module.exports = {
    nodemailer_mailgun_sender: service_mail,
};
