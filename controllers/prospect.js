const prospectService = require("../services/prospect");
const error_processing = require('../common/utils/error_processing');
const {validationResult} = require('express-validator');
const emailService = require('../services/email_sender');
const config = require('../configs/environnement/config');
const no_mail = config.no_mail;
const marketing_mails = config.marketing_mails;


const getAllProspects = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const prospects = await prospectService.getAllProspects();
        return res.status(200).json({
            'data': prospects
        });

    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const createProspect = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        // create the particular service
        const errors = validationResult(req);
        // I check whether there are errors or not
        if (!errors.isEmpty()) {
            const errorList = errors.array();
            return res.status(400).json({
                'message': errorList[0].msg
            });
        }
        req.body.phoneNumber = "237" + req.body.phoneNumber.toString();
        req.body.town = req.body.town.toLowerCase();
        req.body.town = req.body.town.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const prospect = await prospectService.createProspect(req.body);
        const environment = config.env;
        if (Number(no_mail === 0) && environment !== './dev') {
            await emailService.nodemailer_mailgun_sender({
                "from": 'Jobaas <no_reply@jobaas.cm>',
                "to": marketing_mails,
                "subject": ` [${config.env}] Demande d'informations`,
                "html": req.body.message
            });
        }
        message = lang === 'fr' ? "Création d'un nouveau prospect" : 'New prospect created';
        return res.status(200).json({
            'message': message,
            'data': {'id': prospect._id}
        })
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

module.exports = {
    getAllProspects: getAllProspects,
    createProspect: createProspect,
};

