const smsService = require('../../services/sms');
const administratorService = require('../../services/administrator');
const particularService = require('../../services/particular');
const companyService = require('../../services/company');
const error_processing = require('../utils/error_processing');
const config = require('../../configs/environnement/config');

const setRequestIdToTheCurrentAccount =(currentAccount, requestId)=> {
    let dt = new Date();
    dt.setMinutes(dt.getMinutes() + 20);
    dt = dt.toISOString();
    currentAccount.phoneNumber.requestIdExpired = dt;
    currentAccount.phoneNumber.requestId = requestId;
    return currentAccount;
};

const generateSmsCode = async (accountService, userId) => {
    let currentAccount = accountService === 'companyService' ? await companyService.getCompany('id', userId)
        : await particularService.getParticular('id', userId);
    const requestId = Math.floor(100000 + Math.random() * 900000);
    currentAccount = setRequestIdToTheCurrentAccount(currentAccount, requestId);
    if (accountService === 'companyService') {
        await companyService.updateCompany(userId,
            {"phoneNumber": currentAccount.phoneNumber});
    } else {
        await particularService.updateParticular(userId,
            {"phoneNumber": currentAccount.phoneNumber});
    }
    return requestId;
};

const queryVerificationParticularNumber = (accountService) => {
    return async (req, res) => {
        console.log('account Service : ' + accountService);
        console.log('Controller to send sms verification !');
        let currentAccount = accountService === 'companyService' ? await companyService.getCompany('id', req.jwt.userId)
            : await particularService.getParticular('id', req.jwt.userId);
        let message;
        try {
            if (currentAccount) {
                const requestId = Math.floor(100000 + Math.random() * 900000);
                currentAccount = setRequestIdToTheCurrentAccount(currentAccount, requestId);
                if (accountService === 'companyService') {
                    await companyService.updateCompany(req.jwt.userId,
                        {"phoneNumber": currentAccount.phoneNumber});
                } else {
                    await particularService.updateParticular(req.jwt.userId,
                        {"phoneNumber": currentAccount.phoneNumber});
                }
                const text = req.query.lang === 'fr' ? 'Code de verification Jobaas ' + requestId : 'Verification code Jobaas : ' + requestId;
                const result = await smsService.send_notification({
                    'text': text,
                    'to': currentAccount.phoneNumber.value
                });
                if (result.code === 1) {
                    message = req.query.lang === 'fr' ? "code envoyé" : "code sent";
                    return res.status(200).json({
                        'message': message,
                        'data': {'status': true}
                    });
                } else {
                    message = req.query.lang === 'fr' ? "Une erreur est survenue dans la verification du numéro (code)"
                        : "something went wrong in number verification (code)";
                    return res.status(400).json({
                        'message': message,
                        'data': {'status': false}
                    });
                }
            } else {
                message = req.query.lang === 'fr' ? "Ce compte n\'existe pas. Veuillez créer un compte d\'abord" :
                    "It seems this account does not exist. Please register";
                console.log('It seems this account does not exist. Please register');
                return res.status(404).json({
                    'message': message
                });
            }
        } catch (e) {
            console.log(e.message);
            const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
            return res.status(500).json({
                'message': error_processing.process(err)
            });
        }
    }
};


const checkVerificationParticularNumber = (accountService) => {
    return async (req, res) => {
        console.log('account Service : ' + accountService);
        let userId = (typeof req.jwt !== 'undefined' && req.jwt !== null) ? req.jwt.userId : req.params.userId;
        let currentAccount = accountService === 'companyService' ? await companyService.getCompany('id', req.jwt.userId)
            : await particularService.getParticular('id', userId);
        console.log('Controller to verify the pin input by user for phoneNumber verification ! : ' + req.query.pin);
        let mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port :  'https://' + config.hostname;
        mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
        try {
            if (currentAccount) {
                if (new Date() <= new Date(currentAccount.phoneNumber.requestIdExpired)) {
                    console.log(currentAccount.phoneNumber.requestId);
                    if (Number(req.query.pin) === currentAccount.phoneNumber.requestId) {
                        currentAccount.phoneNumber.valid = true;
                        currentAccount.valid = true;
                        if (accountService === 'administratorService') {
                            await administratorService.updateAdministrator(req.params.id, currentAccount);
                        } else if (accountService === 'companyService') {
                            await companyService.updateCompany(userId,currentAccount);
                        } else {
                            await particularService.updateParticular(userId,currentAccount);
                        }
                        mailLink = mailLink + '/fr/login?register=2' ;
                        res.redirect(mailLink);
                    } else {
                        mailLink = mailLink + '/fr/login?register=3' ;
                        res.redirect(mailLink);
                    }
                } else {
                    mailLink = mailLink + '/fr/login?register=3' ;
                    res.redirect(mailLink);
                }
            } else {
                mailLink = mailLink + '/fr/login?register=4' ;
                res.redirect(mailLink);
            }
        } catch (error) {
            console.log(error.message);
            mailLink = mailLink + '/fr/login?register=5' ;
            res.redirect(mailLink);
        }
    }
};


const queryChangeMailAdress = (accountService) => {
    return async (req, res) => {
        console.log('account Service : ' + accountService);
        console.log('Controller to send sms verification !');
        let currentAccount;
        if (accountService === 'administratorService') {
            currentAccount = await administratorService.getAdministrator('id', req.jwt.userId);
        } else {
            currentAccount = accountService === 'companyService' ? await companyService.getCompany('id', req.jwt.userId)
                : await particularService.getParticular('id', req.jwt.userId);
        }
        let message;
        try {
            if (currentAccount) {
                const requestId = Math.floor(100000 + Math.random() * 900000);
                currentAccount = setRequestIdToTheCurrentAccount(currentAccount, requestId);
                const text = req.query.lang === 'fr' ? "Le code à 6 chiffres pour changer l' adresse mail de votre compte Jobaas " + requestId : 'Here is your code to change the mail adress of your Jobaas account: ' + requestId;
                const result = await smsService.send_notification({
                    'text': text,
                    'to': currentAccount.phoneNumber.value
                });
                if (result.code === 1) {
                    let changemail_request = {
                        value : requestId,
                        generatedAt: Date.now(),
                        cause: "change_mail_adress",
                        requestId: String(uuidv4())
                    };
                    let prev_codes = currentAccount.random_code_for_processes;
                    prev_codes.push(forgotten_password_request);
                    if (accountService === 'administratorService') {
                        user = await administratorService.updateAdministrator(user._id, {"random_code_for_processes": prev_codes});
                    } else if (accountService === 'companyService') {
                        user = await companyService.updateCompany(user._id, {"random_code_for_processes": prev_codes});
                    } else {
                        user = await particularService.updateParticular(user._id, {"random_code_for_processes": prev_codes})
                    }
                    message = req.query.lang === 'fr' ? "code envoyé" : "code sent";
                    return res.status(200).json({
                        'message': message,
                        'data': {'status': true}
                    });
                } else {
                    message = req.query.lang === 'fr' ? "Une erreur est survenue dans la verification du numéro pour changer votre adresse mail"
                        : "something went wrong in number verification to change your mail adress (code)";
                    return res.status(400).json({
                        'message': message,
                        'data': {'status': false}
                    });
                }
            } else {
                message = req.query.lang === 'fr' ? "Ce compte n\'existe pas. Veuillez créer un compte d\'abord" :
                    "It seems this account does not exist. Please register";
                console.log('It seems this account does not exist. Please register');
                return res.status(404).json({
                    'message': message
                });
            }
        } catch (e) {
            console.log(e.message);
            const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
            return res.status(500).json({
                'message': error_processing.process(err)
            });
        }
    }
};


const replaceEmailAdress = (accountService) => {
    return async (req, res) => {
        let lang = req.query.lang ? req.query.lang : 'en';
        console.log("Controller for input new password to replace a forgotten one");
        try {
            if (req.body.newEmail) {
                console.log(req.body.newEmail);
            } else {
                let error;
                error = new error_processing.BusinessError("There is no new email in the request", "La nouvelle adresse mail est manquante", 400, "business", lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
                })
            }
            if (!req.body.random_code) {
                let error;
                error = new error_processing.BusinessError("There is no code in the request", "Le code de vérification est manquant", 400, "business", lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
                });
            }
            let user;
            if (accountService === 'administratorService') {
                user = await administratorService.getAdministrator('random_code_for_processes', req.query.requestId);
            } else if (accountService === 'companyService') {
                user = await companyService.getCompany('random_code_for_processes', req.query.requestId);
            } else {
                user = await particularService.getParticular('random_code_for_processes', req.query.requestId);
            }
            const codes = user.random_code_for_processes;
            console.log(codes);
            const found_code = codes.find(element => element.value.toString() === req.body.random_code.toString() && element.requestId === req.query.requestId);
            if (found_code) {
                if ((found_code.generatedAt - Date.now())/1000 > 3600 ) {
                    console.log("The validation of this verification code has elapsed. Please send a new one to renew your mail adress");
                    const err = new error_processing.BusinessError('The validation of this verification code has elapsed. Please send a new one to renew your password',
                                "Le code de vérification renseigné a été généré il y a plus d'une heure et n'est plus valide. Veuillez vous renvoyer un nouveau code pour renouveller le mot de passe", 400, "business", lang);
                    return res.status(400).json({
                    'message': err});
                }
                user.email.value = req.body.newEmail;
                // we activate number and email
                if (user.email) {
                    user.email.valid = true;
                }
                if (user.phoneNumber.valid) {
                    user.phoneNumber.valid = true;
                }
                user.valid = true;
                if (accountService === 'administratorService') {
                    await administratorService.updateAdministrator(user._id, user);
                } else if (accountService === 'companyService') {
                    await companyService.updateCompany(user._id, user);
                } else {
                    await particularService.updateParticular(user._id, user);
                }
                console.log("Email of your account updated. You can try to log in with your new email for your next connection");
                const err = new error_processing.BusinessError("Password updated. You can try to have access to your account now", "Mot de passe mis à jour. Essayez de vous connecter à nouveau", 200, "business", lang);
                return res.status(200).json({
                    'message': error_processing.process(err)
                });
            } else {
                console.log("Email not updated. The code you gave was incorrect. Please try again");
                const err = new error_processing.BusinessError('The code you filled the form with is not the same as the one you received via sms/mail. Please send a new code to renew your password',
                            "Le code de vérification renseigné n'est pas identique à celui généré", 404, "business", lang);

                return res.status(404).json({
                'message': err});
            }
        } catch (error) {
            console.log(error);
            const err = new error_processing.BusinessError(" ", " ", 500, "undefined", lang);
            return res.status(500).json({
                'message': error_processing.process(err)
            })
        }
    };
};


module.exports = {
    generateSmsCode: generateSmsCode,
    queryVerificationParticularNumber: queryVerificationParticularNumber,
    checkVerificationParticularNumber: checkVerificationParticularNumber,
    queryChangeMailAdress: queryChangeMailAdress,
    replaceEmailAdress: replaceEmailAdress
};

