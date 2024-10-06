const jwtSecret = require('../configs/environnement/config').jwt_secret;
const jwt = require('jsonwebtoken');
const config = require('../configs/environnement/config');
const particularService = require('../services/particular');
const companyService = require('../services/company');
const sessionEventsService = require('../services/sessionEvents');
const { v4: uuidv4 } = require('uuid');
const error_processing = require("../common/utils/error_processing");

// token check the account state (verified email)
const login = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        req.body.sessionId = String(uuidv4())
        const token = jwt.sign(req.body, jwtSecret, {expiresIn: config.jwt_expiration_in_seconds});
        console.log('Call of authentification controller ');
        if (req.params.user === 'particular') {
            await particularService.updateParticular(req.body.userId, {"lastConnection": Date.now()});
            await sessionEventsService.createSessionEvents({
                            typeUser: "particular",
                            sessionId: req.body.sessionId,
                            userId: req.body.userId,
            });
        } else if(req.params.user === 'administrator') {
            await companyService.updateCompany(req.body.userId, {"lastConnection": Date.now()});
            await sessionEventsService.createSessionEvents({
                            typeUser: "company",
                            sessionId: req.body.sessionId,
                            userId: req.body.userId,
            });
        }
        console.log("Token was generated successfully");
        return res.status(201).json({
            'data': {
                accessToken: token
            },
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
    login: login,
};
