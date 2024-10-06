// libraries
const fs = require('fs');
const path = require('path');
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const crypto_string = require('crypto-random-string');
//services
const openingService = require('../services/opening');
const logService = require('../services/log');
const particularService = require('../services/particular');
const email_sender = require('../services/email_sender');
const smsFunctions = require('../common/controllers/sms');
const smsService = require('../services/sms');
const no_mail = config.no_mail;
let nbSms =  0 ;
let nbSmsFails =  0 ;
let nbMails = 0 ;
const iTTeamEmails =  "jordanetsafack@gmail.com"; 


// start mongoose connection 
mongoose.connect("mongodb+srv://jobaas:ped.ens*77603621!@jobaas.8r6rd.mongodb.net/jobaas", {
    connectTimeoutMS: 1500,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // sets the delay between every retry (milliseconds)

}).then(
    () => {
        console.log('connected to ' + config.databaseUri);
    });

 

const recallUserToActivateAccount = async () => {

    try {
        
        let startDate = new Date() ;
        const day = startDate.getDay() ; 
        let email,mailLink, apiLink,linkNumberValidation;
        const footer  = fs.readFileSync(path.join(__dirname, '/../common/mails/footer.html'), 'utf8')
        // We define mailLink
        //mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
        //for   prod host we must add  wwww before the link
       // mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
         mailLink = 'https://www.jobaas.cm'  ;
        //Get all particulars        
        let particulars = await particularService.getAllParticulars(0, 0, {valid:false}, false);
        let dataIn,sms_code ;
        console.log(particulars.length+" particulars ") ;
        //NOTIFY JOBAAS TEAM 
        if (Number(no_mail) === 0 ) {
            await email_sender.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": iTTeamEmails,
                "subject": 'Accounts  Jobaas',
                "html": "il y a "+particulars.length+" comptes particuliers non activés"
            });
        }
        for (let particular of particulars.particulars) {
            //We  send a SMS for phonenumber's validation

            apiLink = mailLink + '/api/v1/particular/' + particular.id + '/verify_account?lang=fr&token=' + particular.validationToken.token;
            console.log('apiLink : ' + apiLink);
            sms_code = await smsFunctions.generateSmsCode("particular", particular._id);

            linkNumberValidation = mailLink + '/api/v1/particular/' + particular._id + '/verify_phonenumber?lang=fr&pin=' + sms_code;
            console.log(" validation number "+linkNumberValidation) ;

            dataIn = {
                "text": ` Bonjour  ${particular.surname},\nAfin de valider votre compte, nous vous prions de cliquer sur le lien suivant:\n ${linkNumberValidation}\nEn cas de problème, vous pouvez nous contacter aux numéros suivants:  ${config.phonenumbers}. A très bientôt.`
                , "to": particular.phoneNumber.value
            };

            console.log("no mail in particular controller " + no_mail);

            if (0 === 0) {

                console.log('after the no mail condition');
                // TODO Create a new template mail to remind people to activate their accounts

                if (particular.phoneNumber.value && particular.phoneNumber.value !== "") {
                    await smsService.send_notification(dataIn);
                    nbSms++ ;
                }
            }    
        }


        let endDate = new Date();
        const log =  {
            "name":"recallUserToActivateAccount",
            "status":0,
            "startDate":startDate,
            "endStart":endDate,
            sends: {
                    sms: {success:nbSms,
                          fails:nbSmsFails },
                    emails:{success:nbMails ,
                        fails:0 },            
                    notfications:{success:0 ,
                        fails:0 },
            } 
            
        }
        await logService.createLog(log) ;


    } catch (error) {
        console.log(error);
        var endDate = new Date();
        const log =  {
            "name":"recallUserToActivateAccount",
            "status":1,
            "startDate":startDate,
            "endStart":endDate,
            "error":error      
        }
        await logService.createLog(log) ;


    }
};
// TODO CREATE A TIMER THAT CALL THE PREVIOUS FUNCTIONS 
recallUserToActivateAccount().then(() => {
   
   try{

    process.exit(0)

} catch (error) {
    console.log(error);

    
}

});

