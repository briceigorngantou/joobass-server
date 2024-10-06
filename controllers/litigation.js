//libraries
const litigationService = require('../services/litigation');
const notificationService = require('../services/notification');
const jobService = require('../services/job');
const error_processing = require('../common/utils/error_processing');
// Variables
const _ = require('lodash');
const ADMIN_RIGHTS = require('../common/utils/enum').adminRights;
//

const getAllLitigations = async (req, res) => {

    let litigations;
    let message;
    let lang;
    try {
        let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query) {
            lang = req.query.lang;
            if (req.query.page) {
                req.query.page = parseInt(req.query.page);
                page = Number.isInteger(req.query.page) ? req.query.page : 0;
            }
        }

        // for route /me/litigations
        const intercept = _.intersectionWith(req.jwt.permissionLevel, ADMIN_RIGHTS);
        console.log(intercept);
        console.log('intercept : ' + intercept.length);
        if (req.jwt && intercept.length === 0) {
            req.query.employee = req.jwt.userId;
            litigations = await litigationService.getAllLitigations(limit, page, req.query);
            if (litigations.length === 0) {
                delete req.query.employee;
                req.query.employer = req.jwt.userId;
                litigations = await litigationService.getAllLitigations(limit, page, req.query);
            }
            console.log(req.query);
        } else {
            litigations = await litigationService.getAllLitigations(limit, page, req.query);
        }

        message = req.query.lang === "fr" ? "Il y a des litiges" : "there are litigations";
        return res.status(200).json({
            'message': message,
            'data': litigations
        });

    } catch (error) {
        console.log(error);
        const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }

};

const createLitigation = async (req, res) => {

    try {
        let message;
        //delete field with default value
        delete req.body.receiptDate ;
        delete req.body.state;
        const litigation = await litigationService.createLitigation(req.body);
        const newLitigation = await litigationService.getLitigation(litigation.id);
        const job = await jobService.getJob(newLitigation.job);
        message = req.query.lang === "fr" ? "Création d'un nouveau litige" : "new litigation was created";
        await notificationService.createNotification(
            {
                "receiver": (newLitigation.receiver === "employee") ? newLitigation.employee : newLitigation.employer,
                "text": "Tu fais l'objet d'un nouveau litige pour la mission " + job.title,
                "type_event": "litigation",
                "notif_url": "lien vers les litiges de l'user recevant la plainte"
            }
        );
        return res.status(200).json({
            'message': message,
            'data': litigation
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }

};

const getLitigationById = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const litigation = await litigationService.getLitigation(req.params.idLitigation);
        let message;
        if (!litigation) {
            message = req.query.lang === "fr" ? "Pas de litige trouvé" : "Litigation not found";
            console.log(message);
            return res.status(404).json({
                'message': message
            });
        }
        message = req.query.lang === "fr" ? "Le litige a été identifié par l'id : " + req.params.idLitigation : 'the litigation found by id : ' + req.params.idLitigation;
        return res.status(200).json({
            'message': message,
            'data': litigation
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }

};

const updateLitigation = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    delete req.body.state;
    try {
        const litigation = await litigationService.updateLitigation(req.params.idLitigation, req.body);
        let message;
        if (!litigation) {
            message = req.query.lang === "fr" ? "Pas de litige trouvé" : "Litigation not found";
            console.log(message);
            return res.status(404).json({
                'message': message
            });
        }
        const job = await jobService.getJob(litigation.job);
        await notificationService.createNotification(
            {
                "receiver": litigation.employee,
                "text": "Des infos pour le litige de ta mission " + job.title + " viennent d'être mis à jour",
                "type_event": "litigation",
                "notif_url": "lien vers les litiges de l'user recevant la plainte"
            }
        );
        await notificationService.createNotification(
            {
                "receiver": litigation.employer,
                "text": "Des infos pour le litige de ta mission " + job.title + " viennent d'être mis à jour",
                "type_event": "litigation",
                "notif_url": "lien vers les litiges de l'user recevant la plainte"
            }
        );
        message = req.query.lang === "fr" ? "Mise à jour du litige via l'id : " + req.params.idLitigation : 'the litigation was updated by id : ' + req.params.idLitigation;
        return res.status(200).json({
            'message': message,
            'data': litigation
        });
    } catch (error) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const deleteLitigation = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let message;
        console.log("delete id "+req.params.idLitigation);
        const litigation = await litigationService.deleteLitigation(req.params.idLitigation);
        if (litigation) {
            message = req.query.lang === "fr" ? "Suppression du litige avec l'id : " + req.params.idLitigation : 'the litigation was deleted by id : ' + req.params.idLitigation;
            return res.status(200).json({
                'message': message
            });
        } else {
            message = req.query.lang === "fr" ? "Pas de litige correspondant à l'id : " + req.params.idLitigation : "No litigation found by id : " + req.params.idLitigation;
            return res.status(404).json({
                'message': message
            });
        }
    } catch (error) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

module.exports = {
    getAllLitigations: getAllLitigations,
    createLitigation: createLitigation,
    deleteLitigation: deleteLitigation,
    updateLitigation: updateLitigation,
    getLitigationById: getLitigationById
};
