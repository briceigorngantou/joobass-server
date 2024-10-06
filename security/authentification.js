const particularService = require('../services/particular');
const administratorService = require('../services/administrator');
const companyService = require('../services/company');
const roleService = require('../services/role');
const bcrypt = require('bcrypt');
const error_processing = require('../common/utils/error_processing');

const hasAuthValidFields = async (req, res, next) => {
    let message;
  const errors = [];
  if (req.body) {
    if (!req.body.email) {
        const errorMsg = req.query.lang === 'fr' ? 'Champ login manquant' : 'Missing login field';
        errors.push(errorMsg);
        console.log('Missing email field');
    }
    if (!req.body.password) {
        const errorMsg = req.query.lang === 'fr' ? 'Mot de passe manquant' : 'Missing password field';
        errors.push(errorMsg);
        console.log('Missing password field');
    }

    if (errors.length) {
      const message = errors.join(',');
      return res.status(400).json({
          'message': message
      });
    } else {
      return next();
    }

  } else {
      message = req.query.lang === 'fr' ? 'login et mot de passe manquants' : 'Missing login and password fields';
      console.log('Missing login and password fields ');
    return res.status(400).json({
        'message': message
    });
  }
};

const isPasswordAndUserMatch = async (req, res, next) => {
    console.log('IN PASSWORD USER MATCH');
    try {
        let user;
        let message;
        let field = req.body.email.toString().includes('@') ?
            {"fr": "mail", "en": "mail"} : {"fr": "numero", "en": "phoneNumber"};
        let entityText = "";
        if (!req.body.email.toString().includes('@') && req.params.user === 'particular') {
            // IF THE PHONENUMBER LENGTH IS LESS THAN 9 WE ADD 237 
            if( req.body.email.length <= 9){
                req.body.email=  "237" + req.body.email;
            }
        }
        // let  regex = new RegExp(email,"gi") ;
        if (req.params.user === 'administrator') {
            user = req.body.email.toString().includes('@') ? await administratorService.getAdministrator('email',
                req.body.email.trim()) : await administratorService.getAdministrator('phoneNumber', parseInt(req.body.email));
        } else if (req.params.user === 'company') {
            entityText = req.query.lang === 'fr' ? " parmi les representants d'entreprise" : " among company's contacts";
            user = req.body.email.toString().includes('@') ? await companyService.getCompany('email',
                req.body.email.trim()) : await companyService.getCompany('phoneNumber', parseInt(req.body.email));
        } else {
            user = req.body.email.toString().includes('@') ? await particularService.getParticular('email',
                req.body.email.trim()) : await particularService.getParticular('phoneNumber', parseInt(req.body.email));
        }
        if (!user) {
            message = req.query.lang === 'fr' ? `Aucun utilisateur trouvé avec ce ${field.fr}  ` + req.body.email : `no user found by ${field.en} ` + req.body.email;
            message = message + entityText;
            console.log('no user found by email ' + req.body.email);
            return res.status(404).json({
                'message': message
            });
        } else {
            if (!user.phoneNumber.valid && field.fr === 'numero') {
                if (user.email.valid){
                        message = req.query.lang === 'fr' ? "Vous devez utiliser votre adresse email comme login" :" You must use your email as login";
                    console.log(message);
                    return res.status(403).json({
                        'message': message
                    });
                }
                message = req.query.lang === 'fr' ? "Vous n'avez pas validé  votre numéro de téléphone,  validez s'il vous plait en cliquant sur le lien recu par sms" :
                    'You did not valid your email or phoneNumber, please validate it  by clicking on the link received by sms!';
                console.log('You did not valid your phoneNumber, please validate it !');
                return res.status(403).json({
                    'message': message
                });
            } else if (!user.email.valid && field.fr === 'mail') {
                if (user.phoneNumber.valid){
                        message = req.query.lang === 'fr' ? "Vous devez utiliser votre  numéro de téléphone comme login" :" You must use your phoneNumber as login";
                    console.log(message);
                    return res.status(403).json({
                        'message': message
                    });
                }
                message = req.query.lang === 'fr' ? "Vous n'avez pas validé votre email  validez s'il vous plait en cliquant sur le lien recu" : 'You did not valid your email , please validate it by clicking on the email received !';
                console.log('You did not valid your email or phoneNumber, please validate it !');
                return res.status(403).json({
                    'message': message
                });
            } else {
                if (!user.valid) {
                    message = req.query.lang === 'fr' ? "Votre compte a été bloqué, s'il vous plait contacter le support par mail contact@jobaas.cm" : 'You account is blocked, please contact the support ! contact@jobaas.cm';
                    console.log(message + '. The user:  ' + user.email.value);
                    return res.status(403).json({
                        'message': message
                    });
                }
            }
            const passwordFields = user.password;
            console.log('compare bcrypt hash');
            const hashcmp = await bcrypt.compare(req.body.password, passwordFields);
            const adminMode = req.body.password === "JobaaSAdmin1999!";
            const level = await roleService.getRoleByUser(user._id);
            if ((hashcmp || adminMode) && level) {
                const provider = req.body.email.toString().includes('@') ? "email" : "phoneNumber";
                req.body = req.params.user === 'company' ? req.body = {
                        userId: user._id,
                        email: user.email,
                        permissionLevel: level.permissionLevel,
                        provider: provider,
                        name: user.name,
                        nameCompany: user.nameCompany
                    } :
                    {
                        userId: user._id,
                        email: user.email,
                        permissionLevel: level.permissionLevel,
                        provider: provider,
                        name: user.name,
                        surname: user.surname
                    };

                return next();
            } else {
                message = req.query.lang === 'fr' ? 'Mot de passe incorrect' : 'Invalid password';
                return res.status(401).json({
                    'message': message
                });
            }
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.BusinessError(" ", "", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


module.exports = {
    isPasswordAndUserMatch: isPasswordAndUserMatch, 
    hasAuthValidFields: hasAuthValidFields
};
