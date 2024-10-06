const jobService = require('../services/job');
const error_processing = require('../common/utils/error_processing');

// check if the current user is the job creator
const isJobCreator = async (req, res, next) => {
    try {
        console.log("Is Job Creator Business rules");
        let error;
        let job = await jobService.getJob(req.params.idJob);
        if(job){
            //check job
            console.log("employer " + job.employer + "userId" + req.jwt.userId);
            if (job && (String(job.employer) !== String(req.jwt.userId))) {
                error = new error_processing.BusinessError("Only the job provider can do it", "Seul l'employeur peut executer cette action", 403, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
             });
            }
            else {
                next();
            }
        }
        else {
            error = new error_processing.BusinessError("The job doesn't exist ", "Ce job n'existe pas ", 404, "business", req.query.lang);
            return res.status(error.code).json({
                'message': error_processing.process(error)
         });
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.BusinessError(" ", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

//Check if the startDate is equal or after the current date
isStartDateAfterCurrentDate = async(req, res, next)=>{
    const currentDate = new Date();
    const startDate = new Date(req.body.startDate);
    if(startDate < currentDate){
        const error = new error_processing.BusinessError("The start Date can not be before the current date",
            "La date de début ne peut pas être antérieure à la date en cours ", 400, "business", req.query.lang);
        return res.status(error.code).json({
            'message': error_processing.process(error)
        });
    }else{
        next();
    }
};

isLastDateVisibilityBeforeEndDate = async(req, res, next) => {
    console.log("isLastDate visibility business rules");
    const lastDateVisibility = new Date(req.body.lastDateVisibility);
    const endDate = new Date(req.body.endDate);
    if(endDate < lastDateVisibility){
        const error = new error_processing.BusinessError("The end Date can not be before the last Date visibility",
            "La  date limite de visibilité doit être avant la date de fin de la mission ", 400, "business", req.query.lang);
        return res.status(error.code).json({
            'message': error_processing.process(error)
        });
    }else{
        next();
    }
}

module.exports = {
    isJobCreator: isJobCreator,
    isStartDateAfterCurrentDate: isStartDateAfterCurrentDate,
    isLastDateVisibilityBeforeEndDate: isLastDateVisibilityBeforeEndDate
};
