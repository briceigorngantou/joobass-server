//config
const error_processing = require('../common/utils/error_processing');
const PackService = require('../services/pack');
const {packLevelTypeWithoutFirst} = require("../common/utils/enum");
const {removeDuplicates, stringToBoolean} = require("../common/utils/processing");

const getAllPacks = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let level = 1;
    try {
        const limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }

        console.log("call of  'pack controller: Get All applications ");
        const Packs = await PackService.getAllPacks(limit, page, req.query, level);
        console.log('there are s packs');
        return res.status(200).json({
            'data': Packs
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const createPack = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        //delete field with default value
        console.log('Call controller create a  pack ');
        if(packLevelTypeWithoutFirst.includes(req.body.level.levelType)){
            const previousLevel = await PackService.getPreviousPackLevel(req.body.level.levelType);
            if(previousLevel){
                const advantages =  previousLevel.advantages.concat(req.body.advantages)
                req.body.advantages = removeDuplicates(advantages) ;
                req.body.level.previousLevel =  previousLevel._id;
            }
        }
        req.body.allowAddOn = stringToBoolean(req.body.allowAddOn);
        req.body.insurance.allowInsurance = stringToBoolean(req.body.insurance.allowInsurance);
        const Pack = await PackService.createPack(req.body);
        message = req.query.lang === 'fr' ? 'Un nouvel pack a été crée' : 'new  pack was created';
        console.log('new pack was created');
        return res.status(200).json({
            'message': message,
            'data': Pack
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getPackById = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        //manage who call the get pack for the number of views
        let idPack = req.params.idPack;
        const Pack = await PackService.getPack(idPack);
        let message;
        if (!Pack) {
            const message = lang === "fr" ? `Ce pack n'existe pas pour cet id : ${idPack}`
                : `No Pack found for this id : ${idPack}`;
            return res.status(404).json({
                'message': message
            });
        }
        message = lang === 'fr' ? "Le pack  a été retrouvé" : 'The pack has been found';
        console.log('the pack was found by id' + ' : ' + idPack);
        return res.status(200).json({
            'message': message,
            'data': Pack
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const updatePack = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    let Pack;
    try {
        let idPack = req.params.idPack;
        Pack = await PackService.getPack(idPack);
        if (!Pack) {
            message = lang === 'fr' ? "pack  introuvable" : "pack was not found";
            console.log("pack not found  id : " + idPack);
            return res.status(404).json({
                'message': message
            });
        } else {
            Pack = await PackService.updatePack(idPack, req.body);
            message = req.query.lang === 'fr' ? "Le pack de  a été mise à jour" : "pack was updated";
            console.log("pack was updated by id : " + idPack);
            return res.status(200).json({
                'message': message,
                'data': Pack
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

const getPremiumAdvantages = async(req, res) =>{
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        console.log("call of  'pack controller: Get All premium advantages");
        const pack  = await PackService.getPremiumAdvantages();
        console.log('there premium advantages');
        return res.status(200).json({
            'data': pack.advantages
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
    createPack: createPack,
    updatePack: updatePack,
    getPackById: getPackById,
    getAllPacks: getAllPacks,
    getPremiumAdvantages: getPremiumAdvantages
};