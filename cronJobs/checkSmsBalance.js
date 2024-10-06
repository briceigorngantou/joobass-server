// libraries
const fs = require('fs');
const path = require('path');
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const logService = require('../services/log');
const particularService = require('../services/particular');
const jobService = require('../services/job');
const email_sender = require('../services/email_sender');
const notificationService = require('../services/notification');
const smsService = require('../services/sms');
const no_mail =  config.no_mail;
const no_sms =  config.no_sms;
const axios = require('axios');
const cronJobName = "checkSmsBalance" ;
const user = require('../configs/environnement/config').user_api_sms;
const password = require('../configs/environnement/config').password_api_sms;
const it_mails = config.it_mails; 
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

console.log("cronJob  "+cronJobName);
console.log("before function call");
// this function Generate the new jobs summary
const checkSmsBalance= async () => {

    var startDate = new Date();
    const day = startDate.getDay() ;

    try {

        

        var mail;
        var jobContent = "";
        var jobsCount = 0;
        var smsText;
        var smsNotification;
        var mailLink;
        // log variables
        var status ;
        var nbSms =  0 ;
        var nbSmsFails =  0 ;
        var nbMails = 0;
        var smsStatus ;

        console.log("cronJob  "+cronJobName);


        let headers = {
            'Content-Type': 'application/json'
        };
        let body = {
            user: user,
            password: password,
            };

        const url_api = 'https://smsvas.com/bulk/public/index.php/api/v1/smscredit';
            let options = {
                url: url_api,
                method: 'POST',
                headers: headers,
                data: body
            };
        const result = await axios(options);
        console.log("il vous reste "+result.data.credit+" response code api sms : ");
        if (result.data.credit < 200) {
            
            const    mail ="Il vous reste "+result.data.credit+" SMS";
            await email_sender.nodemailer_mailgun_sender({
                "from": 'Jobaas <info@jobaas.fr>',
                "to": it_mails, "cc": "", "bcc": "",
                "subject": " Balance des sms",
                "html": mail,
                "text": ''
            });
            
            }
        console.log(result.data);
        var endDate = new Date();
        const log =  {
            "name":cronJobName,
            "status":0,
            "startDate":startDate,
            "endStart":endDate,
            "info":"Smscredit "+result.data.credit,
            sends: {
                    sms: {success:nbSms,
                          fails:nbSmsFails },
                    emails:{success:nbMails ,
                        fails:0 },            
                    notfications:{success:nbMails ,
                        fails:0 },
            } 
            
        }

        await logService.createLog(log) ;

    } catch (error) {
        console.log(error);
        var endDate = new Date();
        const log =  {
            "name":cronJobName,
            "status":1,
            "startDate":startDate,
            "endStart":endDate,
            "error":error      
        }
        await logService.createLog(log) ;
    }
 
};
// TODO CREATE A TIMER THAT CALL THE PREVIOUS FUNCTIONS 
checkSmsBalance().then(() => {
   
   try{
    console.log("cronJob  "+cronJobName);
    process.exit(0)

} catch (error) {
    console.log(error);

    
}

});

