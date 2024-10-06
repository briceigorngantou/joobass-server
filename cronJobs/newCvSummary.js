// libraries
const fs = require('fs');
const path = require('path');
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
//services
const particularService = require('../services/particular');
const email_sender = require('../services/email_sender');
// start mongoose connection 

mongoose.connect(config.databaseUri, {
    connectTimeoutMS: 1500,
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(
    () => {
        console.log('connected to ' + config.databaseUri);
    });

console.log("before function call");
// this function Generate the new jobs summary
const sendNewCvSummary = async () => {
    try {
        /*
        var startDate = new Date();
        const n = startDate.getDay()
        // We send  new  with delay of one  day  
        if (n %2 == 0){ 
            mongoose.connection.close()

        }*/

        var jobers = await particularService.getAllParticulars(0, 0, {valid:true, state: "employee","cv.valid":true}, false);
        var mail;
        var jobContent = "";
        var jobsCount = 0;
        var smsText;
        var smsNotification;
        let mailLink;
        // We define mailLink
        mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
        //for   prod host we must add  wwww before the link
        mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
        mailLink += "/fr/jobs"
        let email = "mankolo1974@gmail.com"  
        console.log("cronJob  sendNewCvummary");
        let applications = "" ;
        //We create the mail we will send  
        for (let jober of jobers.particulars) {

            console.log( "Prénom : "+jober.surname.split(" ")[0]+" Tel: "+jober.phoneNumber.value+":   CV  " + jober.cv.url)
            applications+= "<br/><b>Prénom</b> : "+jober.surname.split(" ")[0]+" <b>Tel</b>: "+jober.phoneNumber.value+":   <b>CV</b> <a href =' "+ jober.cv.url+"'> Consulter</a><br/>"
        }

        let mailTemplate = fs.readFileSync(path.join(__dirname, "/../common/mails/sendCv_fr.html"), "utf8");
        mail = mailTemplate.replace("#name", "BRUNO");
        mail = mail.replace("#count", jobers.length);
        mail = mail.replace("#title",  "Agent commercial");
        mail = mail.replace("#town",  "Yaoundé");
        mail = mail.replace("#applications", applications);

        await email_sender.nodemailer_mailgun_sender({
            "from": 'Jobaas <info@jobaas.cm>',
            "to": email, "cc": "", "bcc": "",
            "subject": " Nouveaux candidats  Jobaas",
            "html": mail,
            "text": ''
        });

    } catch (error) {
        console.log(error);
    }
};
// TODO CREATE A TIMER THAT CALL THE PREVIOUS FUNCTIONS 
sendNewCvSummary().then(() => {
    mongoose.connection.close()
});

