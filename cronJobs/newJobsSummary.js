// libraries
const fs = require('fs');
const path = require('path');
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const logService = require('../services/log');
const particularService = require('../services/particular');
const openingService = require('../services/opening');
const jobService = require('../services/job');
const StatsEmployerService = require('../services/statsEmployer');
const employeeStatService = require('../services/statsEmployee');
const email_sender = require('../services/email_sender');
const notificationService = require('../services/notification');
const smsService = require('../services/sms');
const no_mail = config.no_mail;
const no_sms = config.no_sms;
const cronJobName = "newJobsSummary";

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
const sendNewJobsSummary = async () => {

    var startDate = new Date();
    const dayToSend = [2,5];
    const day = startDate.getDay() ;
    const nbMaxSms = 50;
    console.log("env "+config.env);
 
    if (!dayToSend.includes(day) && config.env !== './dev' ){ 
    // No need to log
    return;
    } 

 
    try { 

        let joberNotification , durationInDays = 4
        startDate.setDate(startDate.getDate() - durationInDays);
        var jobers = await particularService.getEmployeesWithStats(); //getAllParticulars(0, 0, {state: "employee"}, false);
        const jobsFilter = {state :'validated',
                            isValid : true,
                            nbPlacesLeft : {$gt: 0},
                            registrationDate : {$gte: startDate}}
        var jobs = await jobService.getAllJobs(0, 0, jobsFilter, 1, false);
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
        // We define mailLink
        mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
        //for   prod host we must add  wwww before the link
        mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
        const rootUrl = mailLink
        mailLink += "/fr/jobs"
        console.log("cronJob  "+cronJobName);
        
        //We create the mail we will send  
        for (let jober of jobers.particulars) {
            //We clear the mail variable
            mail = "";
            jobsCount = 0;
            jobContent = "";
            smsText = `Bonjour ${jober.surname}\nNous  avons des nouveaux jobs pour vous :\n`;
            console.log("jober with email " + jober.email.value+" nbSms: "+jober.statsEmployee[0].nbSms);

            for (let job of jobs.jobs) {


                if (jober.state.includes("employee") && job.employer !== jober._id && jober.tags.some(tag=>job.tags.includes(tag ))) {
                   
                    jobsCount++;
                    jobContent += `<br/><div style="line-height: 24px; text-align: justify;" class="missionCard">
                    <b>${job.title}  à ${job.town}</b><br/>
                    <b>salaire ${(job.isPriceVisible && job.price !=0 ) ?job.price +" FCFA" :"à définir avec  l'employeur "}</b>  FCFA<br/>
                     ${job.description.substr(0,400)} ${job.description.length >400 ? '...':'' }<br/>
               
                </div> `;
                    // We limit the content with 4 jobs , for sms 
                    if (jobsCount <= 2) {
                     
                        smsText += `${jobsCount}. ${job.title} à ${job.town} salaire ${(job.isPriceVisible && job.price != 0 )
                            
                            ?job.price +" FCFA" :"à définir avec l'employeur"}\n`//postuler :  ${mailLink}/${job._id} \n`

                    }

                }
            }


            if (jobsCount > 0) {
                
            // NOTIFY JOBER
            joberNotification = {
                receiver: jober._id,
                text:  smsText,
                type_event: "new_job",
                notifUrl: `/fr/jobs`
            };
            
            await notificationService.createNotification(joberNotification);
            // generate a special for the user 
            const openingId = await openingService.createOpening({targetUrl: mailLink,
                idTarget:jober._id,
                targetUser:jober._id,
                media:"mail"});
          const  openingLinkMail = rootUrl+"/api/v1/opening/"+openingId;

            let mailTemplate = fs.readFileSync(path.join(__dirname, "/../common/mails/summary_jobs_fr.html"), "utf8");
            mail = mailTemplate ;
            const  footer = fs.readFileSync(path.join(__dirname, "/../common/mails/footer.html"), "utf8");
            mail = mailTemplate.replace("#jobs", jobContent);
            mail = mail.replace("#counts", jobsCount);
            mail = mail.replace("#name", jober.surname);
            mail = mail.replace("#footer", footer);
            mail = mail.replace(/#lien/g, openingLinkMail);
            

            if (Number(no_mail) === 0 && jober.email.value) {
            await email_sender.nodemailer_mailgun_sender({
                "from": 'Jobaas <info@jobaas.cm>',
                "to": jober.email.value, "cc": "", "bcc": "",
                "subject": " Nouveaux Jobs sur  Jobaas",
                "html": mail,
                "text": ''
            });
                nbMails++ ;
            }


            if ( Number(no_sms) == 0 && jobsCount > 0  && nbSms <= nbMaxSms && jober.phoneNumber.value && jober.phoneNumber.valid === true ) {                                                    
            
                const openingId = await openingService.createOpening({targetUrl: mailLink,
                    idTarget:jober._id,
                    targetUser:jober._id,
                    media:"sms"});
              const  openingLinkSms = rootUrl+"/api/v1/opening/"+openingId;

                smsText += `\n Postule dès maintenant en  cliquant  sur ce lien suivant  ${openingLinkSms} `
            
                smsNotification = {
                    from: "JOBAAS",
                    to: String(jober.phoneNumber.value),
                    text: smsText
                };
        
                //console.log(smsText) ;
            
                smsStatus =   await smsService.send_notification(smsNotification,true);
                if (smsStatus.code == 1 ){
                    nbSms++ ; 
                    await  employeeStatService.updateStatsEmployee(jober._id,{$inc:{nbSms:1}}, false) ;
                } else { nbSmsFails++ ;}
                            
            }


            }


        }

        var endDate = new Date();
        const log =  {
            "name":cronJobName,
            "status":0,
            "startDate":startDate,
            "endStart":endDate,
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
sendNewJobsSummary().then(() => {
   
   try{
    console.log("cronJob  "+cronJobName);
    process.exit(0)

} catch (error) {
    console.log(error);

    
}

});

