const evaluationService = require('../services/evaluation');
const particularService = require('../services/particular');
const error_processing = require('../common/utils/error_processing');
const processingStats = require('../common/utils/processing');
const employeeStatService = require('../services/statsEmployee');
const jobService = require('../services/job');
const employerStatService = require('../services/statsEmployer');
const notificationService = require('../services/notification');
//configs
const config = require('../configs/environnement/config');
const ENTREPRISE_USER = config.permissionLevels.ENTREPRISE_USER;
const ADMIN_RIGHTS = require('../common/utils/enum').adminRights;
const _ = require('lodash');

const getAllEvaluations = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let page =0 ;
    let anonymous;
    try {
        const limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
        if (req.query.anonymous) {
            anonymous = req.query.anonymous === true;
        }

        const evaluations = await evaluationService.getAllEvaluations(limit, page, req.query, anonymous);
        console.log('there are evaluations');
        return res.status(200).json({
            'data': evaluations
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getEvaluationByJobByUser = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const evaluations = await evaluationService.getEvaluationByJobByUser(req.params.idJob, req.params.idUser);
        console.log('there are evaluations');
        return res.status(200).json({
            'data': evaluations
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const createEvaluation = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let stats;
        let message;
        let mean;
        let result;
        const intercept = req.jwt ? _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS) : null;
        if (req.jwt &&  intercept.length === 0 ) {
            req.body.evaluator = req.jwt.userId;
            if (req.jwt.permissionLevel.includes(ENTREPRISE_USER)) {
                req.body.typeEvaluator = 'entreprise';
            }
        }
        // If no evaluator is provided we take it base on the email.value 
        if(req.body.email) {
            const particular = await particularService.getParticular('email', req.body.email);
            req.body.evaluator = particular._id
        }
        //evaluator and  evaluated must be different
        if (req.body.evaluated && req.body.evaluator === req.body.evaluated) {
            console.log("evaluator can't be evaluated "+req.body.evaluator);
            message = lang === 'fr' ? "Impossible de s'auto évaluer" : "evaluator can't be evaluated";
            return res.status(403).json({
                'message': message
            });
        }
        const evaluation = await evaluationService.createEvaluation(req.body);
        const job = await jobService.getJob(req.body.job);
        let succeeded = req.body.grade > 2 ? 1 : 0;
        let failed = req.body.grade > 2 ? 0 : 1;
        
        if (req.body.evaluated && job.employer.toString() === req.body.evaluated.toString()) {

            stats = (job.employer.toString() === req.body.evaluated.toString()) ? await employerStatService.getStatsByUser(req.body.evaluated) : await employeeStatService.getStatsByUser(req.body.evaluated);
            mean = processingStats.updateMeanRatings(stats.meanRating, req.body.grade, stats.nbEvaluations);
            result = await employerStatService.updateStatsEmployer(req.body.evaluated,
                {
                    "nbEvaluations": stats.nbEvaluations + 1,
                    "meanRating": mean
                });
            await notificationService.createNotification({
                "receiver": job.employer,
                "text": "Vous avez reçu une nouvelle évaluation pour la mission " + job.title + " que vous avez posté",
                "type_event": "evaluation",
                "notifUrl": '/fr/evaluations'
            })
        } else if(req.body.evaluated){
            result = await employeeStatService.updateStatsEmployee(req.body.evaluated,
                {
                    "nbEvaluations": stats.nbEvaluations + 1,
                    "meanRating": mean,
                    "nbJobSucceed": stats.nbJobSucceed + succeeded,
                    "nbJobFailed": stats.nbJobFailed + failed
                });
            await notificationService.createNotification({
                "receiver": req.body.evaluated,
                "text": "Vous avez reçu une nouvelle évaluation pour la mission " + job.title + " que vous avez posté",
                "type_event": "evaluation",
                "notifUrl": '/fr/evaluations'
            });
        }
        if (evaluation) {
            message = lang === 'fr' ? "Nouvelle évaluation a été créée" : "new evaluation was created";
            console.log('new evaluation was created');
            return res.status(200).json({
                'message': message,
                'data': evaluation,
            });
        } else {
            const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
            return res.status(500).json({
                'message': error_processing.process(err)
            });
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getEvaluationById = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const evaluation = await evaluationService.getEvaluation(req.params.idEvaluation);
        let message;
        if (!evaluation) {
            message = lang === 'fr' ? "Aucune évaluation n'a été trouvée" : "Evaluation not found";
            return res.status(404).json({
                'message': message
            });
        }
        message = lang === 'fr' ? "Evaluation trouvée par l'id" : "the evaluation found by id ";
        return res.status(200).json({
            'message': message,
            'data': evaluation,
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getUserEvaluations = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        console.log("get all the evaluations for the particular : " + req.params.userId);
        const limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
        const evaluations = await evaluationService.getUserEvaluations(limit, page, req.params.userId);
        if (!evaluations) {
            message = lang === 'fr' ? "Aucune évaluation n'a été trouvée" : 'Evaluation not found';
            return res.status(404).json({
                'message': message
            });
        }
        message = lang === 'fr' ? " Voici toutes les évaluations de l'utilisateur avec l'id " :
            'All the evaluations found for the particular id';
        return res.status(200).json({
            'message': message,
            'data': evaluations
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const deleteEvaluation = async (req, res) => {
    let message;
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const evaluation = await evaluationService.deleteEvaluation(req.params.idEvaluation);
        if (evaluation) {
            message = lang === 'fr' ? "Suppresion de l'évaluation identifiée par l'id" :
                "the evaluation was deleted by id";
            return res.status(200).json({
                'message': message,
                'data': evaluation
            });
        } else {
            message = lang === 'fr' ? " Aucune évaluation n'a été trouvée via l'id" :
                "no evaluation was found by id";
            return res.status(404).json({
                'message': message
            });
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const updateEvaluation = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    delete req.body.state;
    try {
        const evaluation = await evaluationService.updateEvaluation(req.params.idEvaluation, req.body);
        if (!evaluation) {
            message = lang === 'fr' ? "Aucune évaluation n'a été trouvée via l'id"
                : "evaluation not found id";
            return res.status(404).json({
                'message': message
            });
        }

        const job = await jobService.getJob(evaluation.job);
        const notificationMessage =   lang === 'fr' ?  "Une de vos précédentes évaluations pour la mission " + job.title + " que vous avez posté vient d'être mise à jour" : " One of your previous evaluation for the job  " + job.title + " has been updated";
        if(evaluation && evaluation.evaluated ){
        await notificationService.createNotification({
            "receiver": evaluation.evaluated,
            "text": notificationMessage,
            "type_event": "evaluation",
            "notifUrl": '/fr/evaluations'
        });
    }
        message = lang === 'fr' ? "Mise à jour de l'évaluation via l'id"
            : "the evaluation was updated by id ";
        return res.status(200).json({
            'message': message,
            'data': evaluation
        });

    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


module.exports = {
    getAllEvaluations: getAllEvaluations,
    createEvaluation: createEvaluation,
    deleteEvaluation: deleteEvaluation,
    getEvaluationById: getEvaluationById,
    updateEvaluation: updateEvaluation,
    getUserEvaluations: getUserEvaluations,
    getEvaluationByJobByUser: getEvaluationByJobByUser
};
