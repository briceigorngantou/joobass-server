// libraries
const fs = require('fs');
const path = require('path');
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const logService = require('../services/log');
const particularService = require('../services/particular');
const companyService = require('../services/company');
const administratorService = require('../services/administrator');
const CompanyModel = require('../configs/models/company'); 
const roleService = require('../services/role');  
const jobService = require('../services/job');
const JobModel = require('../configs/models/job');
const employerStatsService = require('../services/statsEmployer');
const employeeStatService = require('../services/statsEmployee');
const email_sender = require('../services/email_sender');
const notificationService = require('../services/notification');
const smsService = require('../services/sms');
const no_mail =  config.no_mail;
const no_sms =  config.no_sms;
const  it_mails = config.it_mails;

const cronJobName = "checkDataQuality";

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
const checkDataQuality = async () => {

    var startDate = new Date();
    const dayToSend = [6]
    const day = startDate.getDay() ;
    const nbMaxSms=50;
 
 /*
    if (!dayToSend.includes(day) ){ 
    // No need to log
    return;
    } */

 
    try {
        let report ="";

        // check total number of user 
        // Nb of row in collection roles = Nb rows in particulars+Nb rows in company+ nb rows in administrators
        const descripttionCheckRole="Nb row  roles = Nb rows particulars+ Nb rows  company+ nb rows  administrators"
        const roles = await roleService.getAllRoles(0, 0) ;
        const nbRoles = roles.length;
        const particulars = await particularService.getAllParticulars(0, 0, {}, false);
        const nbParticulars = particulars.length;
        const companies = await companyService.getAllCompanies(0, 0, {})
        const nbCompanies = companies.length;
        const controllers = await administratorService.getAllAdministrators(0, 0, {}, false);
        const nbControllers = controllers.length; 
        report = nbRoles == (nbParticulars+nbCompanies+nbControllers)? report: report+" Anomalie: "+descripttionCheckRole+" but we have "+nbRoles+"!= "+(nbParticulars+nbCompanies+nbControllers)+" <br/> <br/>";  
        // Number of rows in statemployer = company+ particular ;
        const descriptionStatemployer ="Nb rows statemployer = Nb rows company+ Nb rows particular" ;
        const statEmployer = await employerStatsService.getAllStatsEmployers(0, 0,{}, false) ;
        const nbStatEmployers = statEmployer.length;        
        report = nbStatEmployers == (nbParticulars+nbCompanies)? report: report+" Anomalie: "+descriptionStatemployer+" but we have "+nbStatEmployers+"!= "+(nbParticulars+nbCompanies)+" <br/> <br/>";
        // Number of rows in statemployee = Nb rows particulars
        const descriptionStatemployee ="Nb rows statemployee = Nb rows particulars" ; 
        const statsEmployee = await employeeStatService.getAllStatsEmployees(0, 0,{}, false) ;
        const nbStatsEmployee = statsEmployee.length;   
        report = nbStatsEmployee  == nbParticulars ? report: report+" Anomalie :"+descriptionStatemployee+" but we have "+nbStatsEmployee+"!= "+nbParticulars+" <br/> <br/>";
        // check the number of jobs per  particulars and compare it to  employerStat 
        let aggregatorOpts = [{
            $lookup: {
                from: 'particulars',
                localField: 'employer',
                foreignField: '_id',
                as: 'particulars'
            }
        }, {
            $match: {
                "particulars.0": {
                    $exists: true
                }
            }
        }, {
            $group: {
                _id: "$employer",
                nbJobsCreated: {
                    $sum: 1
                }
        
            }
        }] ;

        jobsAggregat = await JobModel.aggregate(aggregatorOpts).exec();

    
        for (var particular of jobsAggregat ) {

            employerStats = await employerStatsService.getStatsByUser(particular._id); 
            report = particular.nbJobsCreated == employerStats.nbJobCreated ? report : report+` Anomalie : this partcitular ${particular._id} has ${particular.nbJobsCreated} in jobs and ${employerStats.nbJobCreated } in statEmployer <br/> <br/> ` ; 

        }


        // check the number  companies and employerStat for each particular  

        // check the number of jobs per  particulars and compare it to  employerStat 
        aggregatorOpts = [{
            $lookup: {
                from: 'companies',
                localField: 'employer',
                foreignField: '_id',
                as: 'companies'
            }
        }, {
            $match: {
                "companies.0": {
                    $exists: true
                }
            }
        }, {
            $group: {
                _id: "$employer",
                nbJobsCreated: {
                    $sum: 1
                }
        
            }
        }] ;

        jobsAggregat= await JobModel.aggregate(aggregatorOpts).exec();


        for (var company of jobsAggregat ) {
        
            employerStats = await employerStatsService.getStatsByUser(company._id); 
            report = company.nbJobsCreated == employerStats.nbJobCreated  ? report : report+` Anomalie : this company +${company._id} has ${company.nbJobsCreated} from jobs and ${employerStats.nbJobCreated } from statEmployer <br/> <br/>` ; 

        }

        console.log(report);

        // CHECK THE NUMBER particulars 
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
        
        let mailTemplate = fs.readFileSync(path.join(__dirname, "/../common/mails/checkdataquality_fr.html"), "utf8");
        mail = mailTemplate.replace("#report",report) ;

            if ( Number(no_mail) === 0 && report.length > 0) {

                nbMails++ ;
                await email_sender.nodemailer_mailgun_sender({
                    "from": 'Jobaas <info@jobaas.cm>',
                    "to": it_mails, "cc": "", "bcc": "",
                    "subject":cronJobName,
                    "html": mail,
                    "text": ''
                });
            }
            console.log(" "+report);
        

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
checkDataQuality().then(()=> {
   
   try{
    console.log("cronJob  "+cronJobName);


    
    process.exit(0)

} catch (error) {
    console.log(error);

    
}

});

