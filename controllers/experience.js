// libraries
const error_processing = require('../common/utils/error_processing');
// services
const experienceService = require('../services/experience');
const ADMIN_RIGHTS = require('../common/utils/enum').adminRights;
const _ = require('lodash');

//configs
const config = require('../configs/environnement/config');

//TODO CREATE NOTIFICATION
// validation of job by controller


const getAllExperiences = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    const viewAs = req.query.viewAs ? req.query.viewAs : "employee";
    let message;
    try {
        let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query) {
            if (req.query.page) {
                req.query.page = parseInt(req.query.page);
                page = Number.isInteger(req.query.page) ? req.query.page : 0;
            }
        }
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        console.log(intercept);
        console.log('intercept : ' + intercept.length);
        if (req.jwt && intercept.length === 0 && viewAs !== "employer") {
            req.query.employee = req.jwt.userId;
        }
        const experiences = await experienceService.getAllExperiences(limit, page, req.query);
        message = lang === "fr" ? "Les experiences existent" : "there are experiences";
        return res.status(200).json({
            'message': message,
            'data': experiences
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


const createExperience = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    try {
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        if (req.jwt && intercept.length === 0) {
            req.body.employee = req.jwt.userId;
        }
        const experience = await experienceService.createExperience(req.body);
        return res.status(200).json({
            'data': {'id': experience._id}
        });
    } catch (e) {
        console.log('Attemps to create an experience :  ');
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


const getExperienceById = async (req, res) => {
    let message;
    const lang = req.query.lang ? req.query.lang : 'en';
    try {
        let idExperience = req.params.idExperience;
        //console.log(userId);
        const experience = await experienceService.getExperience(idExperience);
        if (experience) {
            delete experience.validationToken;
            return res.status(200).json({
                'data': {
                    "pexperience": experience
                },
            });
        } else {
            message = lang === "fr" ? "Pas d'experience ayant cet id " : "no experience found by id ";
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

const updateExperience = async (req, res) => {
    console.log('update experience process');
    let message;
    const lang = req.query.lang ? req.query.lang : 'en';
    try {
        let experience;
        let idExperience = req.params.idExperience;
        experience = await experienceService.updateExperience(idExperience, req.body);
        if (!experience) {
            message = lang === "fr" ? "Pas d'experience trouvée avec l'id " + idExperience : 'experience not found  id ' + idExperience;
            console.log('experience not found  id ' + idExperience);
            return res.status(404).json({
                'message': message
            });
        }
        message = lang === "fr" ? "Mise à jour de l 'experience compte utilisateur" : 'experience was updated';
        console.log('experience was updated');
        // console.log(expereience);
        return res.status(200).json({
            'message': message,
            'data': experience,
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const deleteExperience = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        let idExperience = req.params.idExperience;
        const state = await experienceService.deleteExperience(idExperience);
        if (state) {
            message = lang === "fr" ? "Suppression de l'experience  avec l'id: " + idExperience : "the experience was deleted by id : " + idExperience;
            console.log('the experience was deleted by id : ' + idExperience);
            return res.status(200).json({
                'message': message
            });
        } else {

            message = lang === "fr" ? "Aucune experience n'a été trouvée" : 'No experience was found';
            console.log(message);
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


const cancelExperience = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        let idExperience = req.params.idExperience;
        const currentExperience = await experienceService.getExperience(idExperience);
        if (currentExperience && currentExperience.isVisible === false) {
            message = lang === "fr" ? "l'experience a déjà  été supprimée " : 'this  experience has already been cancelled';
            console.log(message);
            return res.status(403).json({
                'message': message
            });
        }
        const experience = await experienceService.cancelExperience(idExperience);
        if (experience) {
            message = lang === "fr" ? "Suppression de l'experience  avec l'id: " + idExperience : "the experience was deleted by id : " + idExperience;
            console.log('the experience was deleted by id : ' + idExperience);
            return res.status(200).json({
                'message': message
            });
        } else {
            message = lang === "fr" ? "Aucune experience n'a été trouvée" : 'No experience was found';
            console.log(message);
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


module.exports = {
    getAllExperiences: getAllExperiences,
    createExperience: createExperience,
    deleteExperience: deleteExperience,
    updateExperience: updateExperience,
    getExperienceById: getExperienceById,
    cancelExperience: cancelExperience
};
