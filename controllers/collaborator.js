// libraries
const error_processing = require('../common/utils/error_processing');
const _ = require('lodash');
// services
const humanResourceService = require('../services/collaborator');
//configs
const config = require('../configs/environnement/config');
const ADMIN = config.permissionLevels.ADMIN;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const RH = config.permissionLevels.RH_USER;

const getAllHumanResources = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
        const collaborators = await humanResourceService.getAllHumanResource(limit, page, req.query);
        console.log('there are collaborators');
        return res.status(200).json({
            'data': collaborators
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};



const createHumanResource = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        message = lang === 'fr' ? 'Vous ne pouvez pas ajouter de ressources humaines dans le registre àcause de droits insuffisants' :
         'Bad request you do not have enough rights to add records in the collaborator database';
        if (req.jwt) {
            const intercept_admin = _.intersectionWith(req.jwt.permissionLevel, [SUP_ADMIN, ADMIN]);
            const intercept = _.intersectionWith(req.jwt.permissionLevel, [SUP_ADMIN, ADMIN, RH]);
            if (intercept.length===0) {
                return res.status(400).json({
                    'message': message
                });
            }
        } 
        console.log('Call create collaborator controller');

        // create the collaborator service
        const collaborator = await humanResourceService.createHumanResource(req.body);
            
            message = req.query.lang === 'fr' ? 'Une nouvelle ressource humaine a été crée' : 'new collaborator was created';
            return res.status(200).json({
                'message': message,
                'data': {'id': collaborator._id},
            });
        } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getHumanResourceById = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let humanResourceId = req.params.id ? req.params.id : req.jwt.userId;
        const collaborator = await humanResourceService.getHumanResource('id', humanResourceId);
        if (collaborator) {
            const message = 'collaborator found';
            console.log('collaborator found by id : ' + humanResourceId);
            return res.status(200).json({
                'message': message,
                'data': collaborator,
            });
        } else {
            const message = 'no collaborator found';
            console.log('no collaborator found by id : ' + userId);
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

const updateHumanResource = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let userId;
    let message;
    console.log('update collaborator process');
    try {
        if (req.params.id) {
            humanResourceId = req.params.id;
        } else {
            humanResourceId = req.jwt.userId;
        }
        collaborator = await humanResourceService.updateHumanResource(humanResourceId, req.body);
        if (!collaborator) {
            message = 'collaborator not found';
            console.log('collaborator not found  with id ' + humanResourceId);
            return res.status(404).json({
                'message': message
            });
        }
        message = 'collaborator was updated';
        console.log('collaborator was updated by id ' + humanResourceId);
        return res.status(200).json({
            'message': message,
            'data': collaborator
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const deleteHumanResource = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        let humanResourceId = req.params.id ? req.params.id : req.jwt.userId;
        const state = await humanResourceService.deleteHumanResource(humanResourceId);
        if (state) {
            console.log('the collaborator was deleted by id : ' + humanResourceId);
            const error = new error_processing.BusinessError("the collaborator was deleted", "Le record de la ressource humaine a été supprimée", 200, "business", req.query.lang);
            return res.status(error.code).json({
                'message': error_processing.process(error)
            })
        } else {
            console.log('no collaborator found by id : ' + userId);
            const error = new error_processing.BusinessError("", "", 404, "classic", req.query.lang, "collaborator");
            return res.status(error.code).json({
                'message': error_processing.process(error)
            })
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
    getAllHumanResources: getAllHumanResources,
    createHumanResource: createHumanResource,
    deleteHumanResource: deleteHumanResource,
    updateHumanResource: updateHumanResource,
    getHumanResourceById: getHumanResourceById,
};
