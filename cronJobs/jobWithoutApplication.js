// libraries
const fs = require('fs');
const path = require('path');
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const logService = require('../services/log');
const JobModel = require('../configs/models/job');
const particularService = require('../services/particular');
const jobService = require('../services/job');
const StatsEmployerService = require('../services/statsEmployer');
const employeeStatService = require('../services/statsEmployee');
const email_sender = require('../services/email_sender');
const notificationService = require('../services/notification');
const smsService = require('../services/sms');
const no_mail =  0 //config.no_mail;
const no_sms =  config.no_sms;
const  marketing_mails= config.marketing_mails
const cronJobName = "jobWithNoApplications";

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
const noApplicationForJob = async () => {

    let nbMails = 0 ;
    var startDate = new Date();
    const dayToSend = [1,6]
    const day = startDate.getDay() ;
    // run the job only on a specific aday
    if (! dayToSend.includes(day) ){ 
        // No need to log
        return;
    }   
    try {
        // Create  a pipeline to get all jobs with no appplication
        let aggregatorJobs = [{$lookup: {
            from: 'applications',
            localField: '_id',
            foreignField: 'job',
            as: 'applications'
          }}, {$match: 
          {"state":"validated"}}, {$match: {"applications.0":{$exists:false}}
          }, {$project: {
            _id:1,
            title:1,
            town:1,
            slug:1,
            startDate:1,
            nbViews:1,
            registrationDate:1
            }}] ;
            

            let jobWithNoApplications = await JobModel.aggregate(aggregatorJobs).exec(); 
            let mailContent = "" 
            for (let job of jobWithNoApplications) {

                mailContent+= "<b>"+job.title+" ( Nb de vues "+job.nbViews+") "+" </b> à "+job.town+" date début "+job.startDate+" <a href='https://www.jobaas.cm/fr/job/title_job/"+job.slug+"' "+" > voir </a>  <br/> <br/>"
            }

            let mailTemplate = fs.readFileSync(path.join(__dirname, "/../common/mails/jobs_without_application_fr.html"), "utf8");
            mail = mailTemplate ;
            const  footer = fs.readFileSync(path.join(__dirname, "/../common/mails/footer.html"), "utf8");
            mail = mailTemplate.replace("#jobs", mailContent);
            mail = mail.replace("#footer", footer);
            console.log(" taille "+jobWithNoApplications.length)
            if (Number(no_mail) === 0 &&  jobWithNoApplications.length > 0 ) {
                
            await email_sender.nodemailer_mailgun_sender({
                "from": 'Jobaas <info@jobaas.cm>',
                "to": marketing_mails, "cc": "", "bcc": "",
                "subject": jobWithNoApplications.length+" Jobs  sans candidature",
                "html": mail,
                "text": ''
            });
        }

        var endDate = new Date();
        const log =  {
            "name":cronJobName,
            "status":0,
            "startDate":startDate,
            "endStart":endDate,
            sends: {
                    sms: {success:0,
                          fails:0 },
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
noApplicationForJob().then(() => {
   
   try{
    console.log("cronJob  "+cronJobName);
    process.exit(0)

} catch (error) {
    console.log(error);

    
}

});

