const applicationService = require('../services/application');
const jobService = require('../services/job');
const textProcessing = require('../common/utils/cleanDescription');
const errorProcessing = require('../common/utils/error_processing');
const particularService = require('../services/particular');
const tagsSchool = require('../common/utils/enum').tagsSchool;
const ADMIN_RIGHTS = require('../common/utils/enum').adminRights;
const _ = require('lodash');

//configs
const config = require('../configs/environnement/config');
const phoneNumbers = config.phonenumbers;

// One can't apply twice for the same job
const cantApplyTwice = async (req, res, next) => {
    console.log('business layer for application can not apply twice');
    let filterParams;
    let error;
    try {
        //check the candidate didn't apply  before
        filterParams = {"employee": req.jwt.userId, "job": req.body.job, "state": {"$ne": "cancelled"}};
        let applications = await applicationService.getAllApplications(2, 0, filterParams);
        if (applications.length > 0) {
            error = new errorProcessing.BusinessError("You can't apply twice to the same job.", "Vous ne pouvez pas candidater deux fois pour ce job.", 403, "business", req.query.lang);
            console.log("You can't apply twice to the same job " + req.body.job + " - employee : " + req.jwt.userId);
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

//One can't apply if identity car  is not valid
const checkIdentity = async (req, res, next) => {
    console.log('business layer for application check identity');
    try {
        let error;
        const assignedRoles = req.jwt.permissionLevel;
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (Array.isArray(assignedRoles) && intercept.length > 0) {
            return next();
        } else {
            let particular = await particularService.getParticular("id", req.jwt.userId);
            // Only check if the card is submit because we want to reduce the time 
            if (particular.identityCard) {
                error = new errorProcessing.BusinessError("Your identity card should be valid. Please  upload your identity card", "Ta carte d'identité doit d'abord être vérifiée. Upload là avant d'aller plus loin", 403, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': errorProcessing.process(error)
                });
            } else if (!particular.phoneNumber.valid) {
                error = new errorProcessing.BusinessError("Your phone should be valid. Please  verify it", "Ton numéro de téléphone doit d'abord être vérifié avant d'aller plus loin.", 403, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': errorProcessing.process(error)
                });
            } else if (!particular.profilePic.valid) {
                error = new errorProcessing.BusinessError("Your profile pic should be valid. Please  upload it", "Votre photo de profile doit d'abord être valide", 403, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': errorProcessing.process(error)
                });
            } else {
                return next();
            }
        }
    } catch (e) {
        console.log(e.message);
        const err = new errorProcessing.BusinessError(" ", "", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': errorProcessing.process(err)
        });
    }
};

const checkSchoolLevel = async (req, res, next) => {
    try {
        let error;
        const assignedRoles = req.jwt.permissionLevel;
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (Array.isArray(assignedRoles) && intercept.length > 0) {
            return next();
        } else {
            const job = await jobService.getJob(req.body.job);
            if (job) {
                const intercept = _.intersectionWith(job.tags, tagsSchool);
                if (intercept.length > 0) {
                    let particular = await particularService.getParticular("id", req.jwt.userId);
                    if (!particular.schoolLevel.valid) {
                        error = new errorProcessing.BusinessError("Your school level should be valid to apply for this. Please  upload a proof it", "Veuillez d'abord renseigner et vérifier votre niveau scolaire pour ce type de mission", 403, "business", req.query.lang);
                        return res.status(error.code).json({
                            'message': errorProcessing.process(error)
                        });
                    } else {
                        next();
                    }
                } else {
                    next();
                }
            } else {
                const err = new errorProcessing.BusinessError("", "", 404, "classic", req.query.lang, "job");
                return res.status(404).json({
                    'message': errorProcessing.process(err)
                });
            }
        }
    } catch (e) {
        console.log(e.message);
        const err = new errorProcessing.BusinessError(" ", "", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': errorProcessing.process(err)
        });
    }
};

const anonymizeApplication = async (req, res, next) => {
    console.log('business layer for application anonymize application');
    try {
        //if motivation exists we clean it
        if (req.body.motivations) {
            req.body.motivations = textProcessing.anonymizeText(req.jwt.surname, req.jwt.surname[0] + ".", req.body.motivations);
            req.body.motivations = textProcessing.anonymizeText(req.jwt.name, req.jwt.surname[0] + ".", req.body.motivations);
            req.body.motivations = textProcessing.removePhoneNumber(req.body.motivations, " "+phoneNumbers);
        }
        return next();
    } catch (e) {
        console.log(e.message);
        const err = new errorProcessing.BusinessError(" ", " ", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': errorProcessing.process(err)
        });
    }
};


// check if the current user is the owner of a specific particular
const isOwner = async (req, res, next) => {
    let error;
    try {
        //check the candidate didn't apply  before
        console.log(" id "+req.params.idApplication);
        let application = await applicationService.getApplication(req.params.idApplication);
        if ( application && String(application.employee) !== String(req.jwt.userId)){
            error = new errorProcessing.BusinessError("You can't access an application if you aren't owner", "Vous ne pouvez pas accéder à cette candidature car vous n'êtes pas l'initiateur", 403, "business", req.query.lang);
           return res.status(error.code).json({
               'message': errorProcessing.process(error)
        });
        }
        else if(!application){
            error = new errorProcessing.BusinessError(" ", " ", 404, "classic", req.query.lang, "application");
            return res.status(error.code).json({
                'message': errorProcessing.process(error)
         });
        }
        else {
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

// Is Enough
const hasEnoughApplications = async (req, res, next) => {
    let error;
    try {
        //count candidates accepted
        let job;
        const idJob = req.body.job ? req.body.job : req.params.idJob;
        job = await jobService.getJob(idJob);
            // console.log("  The applications length is  " + data.applications.length + " places number is" + job.nbplaces);
        if (job.nbPlacesLeft <= 0) {
            error = new errorProcessing.BusinessError("You can no longer  apply, there are already enough applications validated",
                "Il n'est plus possible de candidater à cette annonce car le nombre d'employé maximal a été atteint", 403, "business", req.query.lang);
            console.log(errorProcessing.process(error));
            return res.status(error.code).json({
                    'message': errorProcessing.process(error)
                });
            } else {
                next();
            }
    } catch (e) {
        console.log(e.message);
        const err = new errorProcessing.BusinessError(" ", " ", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': errorProcessing.process(err)
        });
    }
};

const hasEnoughEmployees = async (req, res, next) => {
    let error;
    try {
        //count employee accepted
        let job;
        const application = await applicationService.getApplication(req.params.idApplication);
        job = await jobService.getJob(application.job);
        // console.log("  The applications length is  " + data.applications.length + " places number is" + job.nbplaces);
        if (job.nbPlacesLeft <= 0) {
            error = new errorProcessing.BusinessError("You can no longer  validate candidates, there are already enough applications validated",
                "Il n'est plus possible de valider une candidature à cette annonce car le nombre d'employé maximal a été atteint", 403, "business", req.query.lang);
            console.log(errorProcessing.process(error));
            return res.status(error.code).json({
                'message': errorProcessing.process(error)
            });
        } else {
            next();
        }
    } catch (e) {
        console.log(e.message);
        const err = new errorProcessing.BusinessError(" ", " ", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': errorProcessing.process(err)
        });
    }
};

// Is CV required
const checkCv = async (req, res, next) => {
    let error;
    try {
        console.log('Business layer for Check cv');
        let job;
        let particular ;
        const idJob = req.body.job ? req.body.job : req.params.idJob;
        job = await jobService.getJob(idJob);
        if (job.cv_required === true) {
            particular = await particularService.getParticular("id", req.jwt.userId);
            if  (particular) {
                // Only wait for cv to be submit && particular.cv.valid === true 
                if (particular.cv  && particular.cv.url) {
                    next();
                } else {
                     error = new errorProcessing.BusinessError("You must upload  your  cv  before  applying", " Vous devez charger votre CV avant de postuer à cette annonce ", 403, "business", req.query.lang);
                     console.log(errorProcessing.process(error));
                     return res.status(error.code).json({
                    'message': errorProcessing.process(error)
                });
                }
            } else {
                const err = new errorProcessing.BusinessError(" ", " ", 500, "undefined", req.query.lang);
                return res.status(500).json({
                    'message': errorProcessing.process(err)
                });
            }
        } else {
            next() ;
        }
    } catch (e) {
        console.log(e.message);
        const err = new errorProcessing.BusinessError(" ", " ", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': errorProcessing.process(err)
        });
    }
};


module.exports = {
    cantApplyTwice: cantApplyTwice,
    anonymizeApplication: anonymizeApplication,
    checkCv:checkCv ,
    checkIdentity: checkIdentity,
    checkSchoolLevel: checkSchoolLevel,
    isOwner: isOwner,
    hasEnoughApplications: hasEnoughApplications,
    hasEnoughEmployees: hasEnoughEmployees

};
