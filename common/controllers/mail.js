// libraries
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwtSecret = require('../../configs/environnement/config').jwt_secret;
const jwt = require('jsonwebtoken');

const config = require('../../configs/environnement/config');
const no_mail = config.no_mail;
const emailService = require('../../services/email_sender');
const roleService = require('../../services/role');
const particularService = require('../../services/particular');
const administratorService = require('../../services/administrator');
const smsService = require('../../services/sms');
const companyService = require('../../services/company');
const saltRounds = config.sr;
const { v4: uuidv4 } =  require('uuid');

const error_processing = require('../utils/error_processing');

const confirmCreate = (accountService) => {
    return async (req, res) => {
        console.log('account Service : ' + accountService);
        console.log('Controller for email confirmation !');
        let mailLink = config.env === './dev' ?
            'http://' + config.hostname + ':' + config.port :  'https://' + config.hostname;
        try {
            let currentAccount;
            if (accountService === 'administratorService') {
                currentAccount = await administratorService.getAdministrator('id', req.params.id);
            } else if (accountService === 'companyService') {
                currentAccount = await companyService.getCompany('id', req.params.id);
            } else {
                currentAccount = await particularService.getParticular('id', req.params.id);
            }
            if (currentAccount) {
                if (currentAccount.valid === true) {
                    console.log("account already checked by sms or by email");
                    mailLink = mailLink + '/fr/login?register=1' ;
                    res.redirect(mailLink);
                } else {
                    //console.log(currentAccount);
                    if (currentAccount.validationToken.token === req.query.token) {
                        currentAccount.valid = true;
                        currentAccount.email.valid = true;
                        if (accountService === 'administratorService') {
                            await administratorService.updateAdministrator(req.params.id, currentAccount);
                        } else if (accountService === 'companyService') {
                            await companyService.updateCompany(req.params.id, currentAccount);
                        } else {
                            await particularService.updateParticular(req.params.id, currentAccount);
                        }
                        console.log('The account has been activated. Registration completed for ' + req.params.id);
                        mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
                        mailLink = mailLink + '/fr/login?register=2' ;
                        res.redirect(mailLink);
                    } else {
                        console.log("invalid url sorry");
                        mailLink = mailLink + '/fr/login?register=3' ;
                        res.redirect(mailLink);
                    }
                }
            } else {
                console.log('It seems this account does not exist. Please register');
                mailLink = mailLink + '/fr/login?register=4' ;
                res.redirect(mailLink);
            }
        } catch (error) {
            console.log(error);
            mailLink = mailLink + '/fr/login?register=5' ;
            res.redirect(mailLink);
        }
    }
};

const sendMailForgottenPassword = (accountService) => {
    return async (req, res) => {
        console.log("Controller for sending a reset password request:  " + req.body.email);
        req.body.email = req.body.email.toString().toLowerCase().trim();
        let lang = req.query.lang ? req.query.lang : 'en';
        let userType = "";
        try {
            let user;
            if (accountService === 'administratorService') {
                user = administratorService.getAdministrator('email', req.body.email);
            } else if (accountService === 'companyService') {
                user = await companyService.getCompany('email', req.body.email);
                userType= "company"
            } else {
                user = req.body.email.toString().includes('@') ? await particularService.getParticular('email',
                    req.body.email) : await particularService.getParticular('phoneNumber', parseInt(req.body.email));
                userType = "particular"
            }
            if (user !== null) {
                const level = await roleService.getRoleByUser(user._id);
                let name = accountService === 'companyService' ? user.name : user.name + ' ' + user.surname;
                let body = {
                    userId: user._id,
                    email: user.email.value,
                    permissionLevel: level.permissionLevel,
                    provider: 'email',
                    name: name
                };
                body.refreshKey = crypto.randomBytes(16).toString('base64');
                // Create a token valid one day
                const token = jwt.sign(body, jwtSecret, {expiresIn: 900}); //config.jwt_expiration_in_seconds
                let mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port :
                    'https://' + config.hostname;
                mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
                let htmlFile;
                htmlFile = lang === 'fr' ? '../mails/forgottenPassword_fr.html' : '../mails/forgottenPassword_en.html';
                console.log('mailLink : ' + mailLink + ' hostname : ' + config.hostname);
                const apiLink = mailLink + '/' + lang + '/change-password/'+userType+'?token='+token
                console.log('apiLink : ' + apiLink);
                let code;
                if (Number(no_mail) === 0) {
                    if (req.body.email.includes('@')) {
                        let email = fs.readFileSync(path.join(__dirname, htmlFile), 'utf8');
                        email = email.replace('#name', user.name);
                        email = email.replace(/#lien/g, apiLink);
                        console.log("email sent for resenting password");
                        code = await emailService.nodemailer_mailgun_sender({
                            "from": `[${config.env}] Jobaas <no_reply@jobaas.cm>`,
                            "to": req.body.email, "cc": '', "bcc": '',
                            "subject": 'Demande de renouvellement de mot de passe',
                            "html": email,
                            "text": '',
                        });
                        code = code === true ? 1 : 0;
                    } else {
                        let text = "Bonjour " + user.surname + ".\n" +
                            "Merci de cliquer sur le lien suivant s'il vous plait pour la réinitialisation de votre mot de passe. \n " + apiLink;
                        let sms = {
                            from: "JOBAAS",
                            to: String(user.phoneNumber.value),
                            text: text
                        };
                        code = await smsService.send_notification(sms);
                    }
                    if (code === 0) {
                        const err = new error_processing.BusinessError(" ", "", 500, "undefined", lang);
                        return res.status(500).json({
                            'message': error_processing.process(err)
                        });
                    }
                } else {
                    console.log("email blocked for resenting password");
                }
                const err = new error_processing.BusinessError("Email for reseting password sent. Check your mails", "Un email de reinitilisation du mot de passe a été envoyé, regardez vos mails", 200, "business", req.query.lang);
                return res.status(200).json({
                    'message': error_processing.process(err)
                });
            } else {
                const err = new error_processing.BusinessError("This email address is not registered. Please create an account first", "Cet email n'est pas enregistré, s'il vous plait créer un compte au préalable", 404, "business", req.query.lang);
                return res.status(404).json({
                    'message': error_processing.process(err)
                });
            }

        } catch (e) {
            console.log(e.message);
            const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
            return res.status(500).json({
                'message': error_processing.process(err)
            });
        }
    };
};

const sendMailForgottenPasswordRandomCode = (accountService) => {
    return async (req, res) => {
        console.log("Controller for sending a reset password request:  " + req.body.email);
        req.body.email = req.body.email.toString().toLowerCase().trim();
        let lang = req.query.lang ? req.query.lang : 'en';
        let userType = "";
        try {
            let user;
            if (accountService === 'administratorService') {
                user = req.body.email.toString().includes('@') ?  administratorService.getAdministrator('email',
                    req.body.email) : administratorService.getAdministrator('phoneNumber', parseInt(req.body.email));
            } else if (accountService === 'companyService') {
                user = req.body.email.toString().includes('@') ? await companyService.getCompany('email',
                    req.body.email) : await companyService.getCompany('phoneNumber', parseInt(req.body.email));
                userType= "company"
            } else {
                user = req.body.email.toString().includes('@') ? await particularService.getParticular('email',
                    req.body.email) : await particularService.getParticular('phoneNumber', parseInt(req.body.email));
                userType = "particular"
            }
            if (user !== null) {
                //create a body to keep track of the request to change password. request has the 6 figures random code and an id
                let forgotten_password_request = {
                    value : Math.floor(100000 + Math.random() * 900000),
                    generatedAt: Date.now(),
                    cause: "change_password",
                    requestId: String(uuidv4())
                };
                let name = accountService === 'companyService' ? user.name : user.name + ' ' + user.surname;

                let mailLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port :
                    'https://' + config.hostname;
                mailLink = config.env === './production' ? 'https://www.' + config.hostname : mailLink;
                let htmlFile;
                htmlFile = lang === 'fr' ? '../mails/forgottenPassword_fr_new.html' : '../mails/forgottenPassword_en_new.html';
                console.log('mailLink : ' + mailLink + ' hostname : ' + config.hostname);
                const apiLink = mailLink + '/' + lang + '/change-password/'+userType+'?requestId='+forgotten_password_request.requestId;
                let code;
                if (Number(no_mail) === 0) {
                    if (req.body.email.includes('@')) {
                        let email = fs.readFileSync(path.join(__dirname, htmlFile), 'utf8');
                        email = email.replace('#name', user.name);
                        email = email.replace(/#code/g, String(forgotten_password_request.value));
                        console.log("email sent for resenting password");
                        code = await emailService.nodemailer_mailgun_sender({
                            "from": `[${config.env}]Jobaas <no_reply@jobaas.cm>` ,
                            "to": req.body.email, "cc": '', "bcc": '',
                            "subject": 'Demande de renouvellement de mot de passe',
                            "html": email,
                            "text": '',
                        });
                        code = code === true ? 1 : 0;
                    } else {
                        let text = "Bonjour " + user.name + ".\n" +
                            "Le code à 6 chiffres pour réinitialiser votre mot de passe est. \n " + String(forgotten_password_request.value);
                        let sms = {
                            from: "JOBAAS",
                            to: String(user.phoneNumber.value),
                            text: text
                        };
                        code = await smsService.send_notification(sms);
                    }
                    if (code === 0) {
                        const err = new error_processing.BusinessError(" ", "", 500, "undefined", lang);
                        return res.status(500).json({
                            'message': error_processing.process(err)
                        });
                    }
                } else {
                    console.log("email blocked for resenting password");
                }
                let prev_codes = user.random_code_for_processes;
                prev_codes.push(forgotten_password_request);
                if (accountService === 'administratorService') {
                    user = await administratorService.updateAdministrator(user._id, {"random_code_for_processes": prev_codes});
                } else if (accountService === 'companyService') {
                    user = await companyService.updateCompany(user._id, {"random_code_for_processes": prev_codes});
                } else {
                    user = await particularService.updateParticular(user._id, {"random_code_for_processes": prev_codes})
                }
                return res.status(200).json({
                    'data': {'url': apiLink},
                    'message': "Code for resetting password sent. Check your mails or sms"
                });
            } else {
                const err = new error_processing.BusinessError("This email address is not registered. Please create an account first", "Cet email n'est pas enregistré, s'il vous plait créer un compte au préalable", 404, "business", req.query.lang);
                return res.status(404).json({
                    'message': error_processing.process(err)
                });
            }
        } catch (e) {
            console.log(e.message);
            const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
            return res.status(500).json({
                'message': error_processing.process(err)
            });
        }
    };
};

const replaceForgottenPassword = (accountService) => {
    return async (req, res) => {
        console.log("Controller for input new password to replace a forgotten one");
        try {
            if (req.body.password) {
                console.log("new password: " + req.body.password);
                const hash = await bcrypt.genSalt(Number(saltRounds));
                req.body.password = await bcrypt.hash(req.body.password, hash);
            } else {
                let error;
                error = new error_processing.BusinessError("There is no password in the request", "Le mot de passe est manquant", 400, "business", req.query.lang);
                return res.status(error.code).json({
                    'message': error_processing.process(error)
                })
            }
            console.log(req.body.password);
            let user;
            if (accountService === 'administratorService') {
                user = await administratorService.getAdministrator('id', req.jwt.userId);
            } else if (accountService === 'companyService') {
                user = await companyService.getCompany('id', req.params.id);
            } else {
                user = await particularService.getParticular('id', req.jwt.userId);
            }
            user.password = req.body.password;
            // we activate number and email
            if (user.email) {
                user.email.valid = true;
            }
            if (user.phoneNumber.valid) {
                user.phoneNumber.valid = true;
            }
            user.valid = true;
            if (accountService === 'administratorService') {
                await administratorService.updateAdministrator(req.jwt.userId, user);
            } else if (accountService === 'companyService') {
                await companyService.updateCompany(req.jwt.userId, user);
            } else {
                await particularService.updateParticular(req.jwt.userId, user);
            }
            console.log("Password updated. You can try to have acces to your account now");
            const err = new error_processing.BusinessError("Password updated. You can try to have acces to your account now", "Mot de passe mis à jour. Essayez de vous connecter à nouveau", 200, "business", req.query.lang);
            return res.status(200).json({
                'message': error_processing.process(err)
            });
        } catch (error) {
            console.log(error);
            const err = new error_processing.BusinessError(" ", " ", 500, "undefined", req.query.lang);
            return res.status(500).json({
                'message': error_processing.process(err)
            })
        }
    };
};

const replaceForgottenPasswordRandomCode = (accountService) => {
    return async (req, res) => {
        let lang = req.query.lang ? req.query.lang : 'en';
        console.log("Controller for input new password to replace a forgotten one");
        try {
            if (req.body.password) {
                console.log(req.body.password);
                const hash = await bcrypt.genSalt(Number(saltRounds));
                req.body.password = await bcrypt.hash(req.body.password, hash);
            } else {
                let error;
                error = new error_processing.BusinessError("There is no password in the request", "Le mot de passe est manquant", 400, "business", lang);
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
                    console.log("The validation of this verification code has elapsed. Please send a new one to renew your password");
                    const err = new error_processing.BusinessError('The validation of this verification code has elapsed. Please send a new one to renew your password',
                                "Le code de vérification renseigné a été généré il y a plus d'une heure et n'est plus valide. Veuillez vous renvoyer un nouveau code pour renouveller le mot de passe", 400, "business", lang);
                    return res.status(400).json({
                    'message': err});
                }
                user.password = req.body.password;
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
                console.log("Password updated. You can try to have access to your account now");
                const err = new error_processing.BusinessError("Password updated. You can try to have access to your account now", "Mot de passe mis à jour. Essayez de vous connecter à nouveau", 200, "business", lang);
                return res.status(200).json({
                    'message': error_processing.process(err)
                });
            } else {
                console.log("Password updated. You can try to have acces to your account now");
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
    confirmCreate: confirmCreate,
    sendMailForgottenPassword: sendMailForgottenPassword,
    replaceForgottenPassword: replaceForgottenPassword,
    sendMailForgottenPasswordRandomCode: sendMailForgottenPasswordRandomCode,
    replaceForgottenPasswordRandomCode: replaceForgottenPasswordRandomCode
};
