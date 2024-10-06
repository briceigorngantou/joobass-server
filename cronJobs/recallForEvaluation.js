// libraries
const config = require('../configs/environnement/config');
const mongoose = require('mongoose');
const logService = require('../services/log');
const particularService = require('../services/particular');
const applicationService = require('../services/application');
const jobService = require('../services/job');
const evaluationService = require('../services/evaluation');
const smsService = require('../services/sms');
const no_sms = config.no_sms;
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
const recallForEvaluation = async (nbApplicationMin = 2) => {

    try {

        var startDate = new Date();
        const day = startDate.getDay()
        // We send recall with a delay of six days
        if (day %7 == 0 ){
            return ;
        }
        // we define filter for different resources
        let filterParams, filterParamsJobs , filterParamsApplications, filterParamsEvaluations;
        let nbSms = 0, nbSmsFails = 0 ,nbNotifications= 0, nbMails;
        let jobsData, applicationsData, message, level;
        //we loop on all particulars whom account is valid
        let employer ;
        let employee ;
        let mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
        mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
        let rootEvaluationUrl = "/fr/evaluation-post" ;
        let  token ;
        //we find all jobs validated for those particulars
        messages = [];
        goToTheNext = false;

        filterParamsJobs = { state:"completed"}
        jobsData = await jobService.getAllJobs(1, 0, filterParamsJobs, undefined, false);
        console.log(" War machine "+ jobsData.length) ;
        for (let job of jobsData.jobs) {
                console.log(" War machine ") ;
                //we find all the applications
                filterParamsApplications = {state: "validated","job": job._id};
                employer = await  particularService.getParticular("id", job.employer)
                employer =  employer ? employer: await  companyService.getCompany("id", job.employer)  ;
                applicationsData = await applicationService.getAllApplications(1,0,filterParamsApplications)
                console.log("employee "+employer.name+" a "+ applicationsData.length+" "+job._id )
                //we find all the related evaluations
                filterParamsEvaluations = {"job": job._id,
                                           "evaluated": job.employer};

                // check job provider has been   evaluated by jober
                evaluationsData = await evaluationService.getAllEvaluations(1, 0, filterParamsEvaluations, false);


                console.log(" il y a " + evaluationsData.length+" applicationsData "+ job._id);
                if (evaluationsData.length == 0) {

                    console.log ("Evaluations du job provider, Nb applications "+applicationsData.length) ;

                    for (let application  of applicationsData.applications) {
                        console.log("Test:")
                        employee = await particularService.getParticular("id", application.employee) ;

                        evaluationUrl = mailLink+rootEvaluationUrl+"/"+job._id+"/"+employee._id+"/"+job.employer+"/particular/employer" ;

                        message= `Bonjour ${employee.surname},\n Nous vous prions de bien  vouloir évaluer votre employeur   pour la mission de: ${job.title} en cliquant sur le lien suivant :\n ${evaluationUrl} ` ;
                        smsNotification = {
                            from: "JOBAAS",
                            to: String(employee.phoneNumber.value),
                            text: message
                        };


                         console.log(employee.phoneNumber.value+"  \n"+message) ;
                       if ( Number(no_sms) === 0 ) {


                        await smsService.send_notification(smsNotification);
                       }
                   // check job provider has  evaluated jober
                   filterParamsEvaluations = {"job": job._id,
                   "evaluator": application.employee};
                   evaluationsData = await evaluationService.getAllEvaluations(1, 0, filterParamsEvaluations, false);
                   console.log(" il y a " + evaluationsData.length+" évaluations ");
                   if (evaluationsData.length == 0) {

                       console.log ("évaluations du jober") ;
                       evaluationUrl = mailLink+rootEvaluationUrl+"/"+job._id+"/"+job.employer+"/"+applicationsData.applications[0].employee+"/"+ (employer.fiscalNumber?"company":"particular")+"/employee" ;
                       message= `Bonjour ${employer.surname},\n Nous vous prions de bien  vouloir évaluer votre employé   pour la mission de: ${job.title} en cliquant sur le lien suivant :\n ${evaluationUrl } ` ;

                       console.log(message)

                       smsNotification = {
                           from: "JOBAAS",
                           to: String(employer.phoneNumber.value),
                           text: message
                       };
                       if ( Number(no_sms) === 0 ) {
                        smsStatus =   await smsService.send_notification(smsNotification);
                        if (smsStatus.code == 1 ){
                            nbSms++ ;
                        } else { nbSmsFails++ ;}


                       }
                   }


                    }

                }

            }


            var endDate = new Date();
            const log =  {
                "name":"recallForEvaluation",
                "status":0,
                "startDate":startDate,
                "endStart":endDate,
                sends: {
                        sms: {success:nbSms,
                              fails:nbSmsFails },
                        emails:{success:nbMails ,
                            fails:0 },
                        notfications:{success: nbNotifications ,
                            fails:0 },
                }

            }
            await logService.createLog(log) ;


    } catch (error) {
        console.log(error);
        var endDate = new Date();
        const log =  {
            "name":"recallForEvaluation",
            "status":1,
            "startDate":startDate,
            "endStart":endDate,
            "error":error
        }
        await logService.createLog(log) ;

    }
};


recallForEvaluation().then(() => {
    process.exit(0)
});
