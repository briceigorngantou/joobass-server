// libraries
const fs = require('fs');
const pdf = require('html-pdf');
const path = require('path');
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const particularService = require('../services/particular');
const jobService = require('../services/job');
const applicationService = require('../services/application');
const notificationService = require('../services/notification');
const no_mail = 0;//config.no_mail; //TODO CHANGE IT

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

console.log("applicationSummary");
console.log("before function call");

const sendApplicationSummary = async () => {

    try{
         
        let joberNotification;
        var mail = '';
        let email;
        let smsText = '';
        var mailLink;
        // log variables
        // We define mailLink
        mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
        //for   prod host we must add  wwww before the link
        mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
        console.log("cronJob  applicationSummary");

        const jobersProvider = await particularService.getAllParticulars(0, 0, {state: "employer"}, false);

        for(let employer of jobersProvider.particulars){

            const jobsFilter = {employer: employer._id, state: 'validated', isValid: true};
            const jobs = await jobService.getAllJobs(0, 0, jobsFilter, 1, false);
            //joberContent = `<h3> Bonjour ${employer.surname + " " + employer.name}</h3>`;

            for (let job of jobs.jobs) {

                const applicationFilter = {job: job._id, state: "done"};
                var applications = await applicationService.getAllApplications(0,0, applicationFilter, false);
                //console.log(job._id);
                //console.log(applications);
                
                
                for(let application of applications.applications){
                    var jober = await particularService.getParticular("_id" , application.employee);
                    
                    mail += `<tr style="line-height: 24px; text-align: justify; font-size: 12px; font-family: 'Work Sans', Calibri, sans-serif;" class="missionCard">
                    <p>Noms et prénoms : ${jober.name + " " + jober.surname}</p>
                    <p>Date de naissance : ${jober.birthday}</p>
                    <p>Email : ${jober.email.value}</p>
                    <p>Téléphone : ${jober.phoneNumber.value}</p>
                    <p>Adresse : ${jober.town + " " + jober.street + " " + jober.refereneStreet + "\n"}</p>
                    <p>Profession : ${jober.profession + "."}</p><pre>${"\n"}</pre>
                    </tr> `;
                    
                }

                if(mail !== ''){
                    smsText += `<tr style="color: #0f0f0f; font-size: 15px; font-family: 'Work Sans', Calibri, sans-serif; line-height: 24px;"><u>Job </u>: <b>${job.title}</b> </tr>` + mail;
                    //smsText = mail;
                    mail = '';
                }
    
                //console.log(mail);
    
            }

            joberNotification = {
                receiver: employer._id,
                text:  "test",
                type_event: "job_candidates",
                notifUrl: `/fr/jobs`
            };
            await notificationService.createNotification(joberNotification); 
            //console.log("ok")

            let mailTemplate = fs.readFileSync(path.join(__dirname, "/../common/mails/summary_application.html"), "utf8");
            email = mailTemplate ;
            const  footer = fs.readFileSync(path.join(__dirname, "/../common/mails/footer.html"), "utf8");
            email = mailTemplate.replace("#jobers", smsText);
            email = email.replace("#name", employer.surname);
            email = email.replace("#footer", footer);

            if (Number(no_mail) === 0 && smsText !== '') {
                //console.log(joberProvider.email.value);
            /* await email_sender.nodemailer_mailgun_sender({
                "from": 'Jobaas <info@jobaas.cm>',
                "to": "timamomarion9@gmail.com", "cc": "", "bcc": "",
                "subject": " Vos candidats ",
                "html": email ,
                "text": ""
            }); */
                //console.log(employer.email.value);
                //nbMails++ ;
                console.log("Debut");
                var options = { format: 'A4' };

                let qq = pdf.create(email, options);
                
                let v = qq.toFile('Test.pdf', function(error, result) {
                    if (error) return console.log(error);
                    console.log(result);
                });
                console.log(qq);
                console.log(v);
                
            }

            smsText = "";
            
    
        }

    }catch(error){
        console.log(error);
    }
};

sendApplicationSummary().then(() => {
   
    try{
         console.log("cronJob  sendApplicationSummary");
         process.exit(0)
 
     } catch (error) {
         console.log(error);
 
     
     }
 
 });