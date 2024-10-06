const applicationService = require('../services/application');
const litigationService = require('../services/litigation');
const jobService = require('../services/job');
const error_processing = require('../common/utils/error_processing');

// check if the current can create a litiagation  wheter it it the job provider or the jober
//TODO CHECK IT AND PAGINATION PROPERTIES
const canComplain = async (req, res, next) => {
    try {
        console.log("call business constraint ");
        let error;
        if (!req.params.idLitigation) {
            //check the candidate  applied
            let application;
            let applicationList = await applicationService.getAllApplications(5, 0,
                {'job': req.body.job, 'employee': req.body.employee});
            if (applicationList.length > 0) {
                application = applicationList.applications[0];
                if (application.state === 'validated') {
                    let job = await jobService.getJob(req.body.job);
                    if (String(req.body.employee) === String(req.jwt.userId)) {
                        req.body.employee = req.jwt.userId;
                        req.body.receiver = "employer";
                        return next();
                    } else if (String(job.employer) === String(req.jwt.userId)) {
                        req.body.receiver = "employee";
                        return next();
                    } else {
                        error = new error_processing.BusinessError("You can't complain for  this  application.", "Vous ne pouvez pas emettre de plainte pour cette annonce.", 403, "business", req.query.lang);
                        return res.status(error.code).json({
                            'message': error_processing.process(error)
                        });
                    }
                } else {
                    error = new error_processing.BusinessError("there is no  validated application associated with the job and employee.", "Il n'y a aucune candidature validée associée avec ce job ou cet employé.", 404, "business", req.query.lang);
                    return res.status(error.code).json({
                        'message': error_processing.process(error)
                    });
                }
            } else {
                error = new error_processing.BusinessError("there is no application associated with the job and employee.", "Il n'y a aucune candidature validée associée avec ce job ou cet employé", 404, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
                });
            }
        } else {
            const litigation = await litigationService.getLitigation(req.params.idLitigation);
            if (litigation) {
                let job = await jobService.getJob(req.body.job);
                if (String(litigation.employee) === String(req.jwt.userId)) {
                    return next();
                } else if (String(job.employer) === String(req.jwt.userId)) {
                    return next();
                } else {
                    error = new error_processing.BusinessError("Unauthorized", "Non authorisé", 403, "business", req.query.lang);
                    return res.status(error.code).json({
                        'message': error_processing.process(error)
                    });
                }
            } else {
                error = new error_processing.BusinessError("You can't find this  application", "Impossible de trouver cette candidature", 404, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
                });
            }
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

module.exports = {
    canComplain: canComplain
};
