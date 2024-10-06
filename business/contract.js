const applicationService = require('../services/application');
const error_processing = require('../common/utils/error_processing');

// check if the employee has applied for this job
const hasApplied = async (req, res, next) => {
    try {
        if(req.body.employee && req.body.employee !== ""){
            let error;
            let application = await applicationService.getApplicationByEmployeeAndJob(req.body.employee, req.params.idJob);
            if(application && application.state === "done"){
                    next();
            }else {
                error = new error_processing.BusinessError("The application for this job by his employee doesn't exist ",
                "la candidature pour ce job par cet employé n'existe pas ", 404, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
            });
            }
        }else{
            next();
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.BusinessError(" ", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

module.exports = {
    hasApplied: hasApplied
};
