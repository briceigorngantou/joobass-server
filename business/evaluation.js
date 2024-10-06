const applicationService = require('../services/evaluation');
const particularService = require('../services/particular');
const errorProcessing = require('../common/utils/error_processing');

// One can't Evaluate twice for the same job
const cantEvaluateTwice = async (req, res, next) => {
    let filterParams;
    let error;
    try {
        //check the candidate didn't apply  before. We check the 3 fields cause an employer can also be evaluated
                // If no evaluator is provided we take it base on the email.value 
        if(req.body.email) {
            const particular = await particularService.getParticular('email', req.body.email);
            req.body.evaluator = particular._id
        }

        filterParams = {"evaluator": req.body.evaluator,
                        "job": req.body.job};
        let evaluations = await applicationService.getAllEvaluations(2, 0, filterParams);
        if (evaluations.length > 0) {
            error = new errorProcessing.BusinessError("You can't evaluate twice for  the same job.", "Vous ne pouvez pas évaluer deux fois pour ce job.", 403, "business", req.query.lang);
            console.log("You can't Evaluate twice for the  to the same job " + req.body.job + " - evaluator  : " + req.body.evaluator + " - evaluated : " + req.body.evaluated);
            return res.status(error.code).json({
                'message': errorProcessing.process(error)
            });
        } else {
            return next();
        }
    } catch (e) {
        console.log(e.message);
        const err = new errorProcessing.BusinessError(" ", "", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': errorProcessing.process(err)
        });
    }
};

module.exports = {
    cantEvaluateTwice: cantEvaluateTwice
};
