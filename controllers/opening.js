// libraries
const error_processing = require('../common/utils/error_processing');
const bcrypt = require('bcrypt');
const processing = require('../common/utils/processing');
// services
const openingService = require('../services/opening');

const _ = require('lodash');

//configs
const config = require('../configs/environnement/config');
const no_mail = config.no_mail;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;
const saltRounds = config.sr;



const createOpening = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';

    try {
            console.log('Call create opening controller');
            const id = await openingService.createOpening(req.body);
            let message ;
            // security control for business
            // check the state
            let urlLink;
            // We define mailLink
            urlLink = config.env === './dev' ? 'http://' + config.hostname + ':' + config.port : 'https://' + config.hostname;
            //for   prod host we must add  wwww before the link
            urlLink = config.env === './production' ? 'https://www.' + config.hostname :  urlLink;
            const apiLink = urlLink + '/api/v1/opening/' + id ;
            message = lang ==='fr'? "votre lien a été généré":"your link has been generated"
            return res.status(200).json({
                'message': message,
                'data': apiLink
              });


    } catch (e) {

        console.log('Fail to create an link');
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getOpening = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';

    try {

            console.log('Call create opening controller');
            const opening = await openingService.getOpening(req.params.idOpening);
            res.redirect(opening.targetUrl)


    } catch (e) {

        console.log('Fail to create an link');
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const updateOpening = async (req, res) => {
    console.log('update particular process');
    let message;
    const lang = req.query.lang ? req.query.lang : 'en';
  try {
    let particular;
      if (req.body.password) {
          const hash = await bcrypt.genSalt(Number(saltRounds));
          if (processing.securePassword(req.body.password)) {
              req.body.password = await bcrypt.hash(req.body.password, hash);
          } else {
              message = lang === 'fr' ? 'Mot de passe invalide. Il doit comporter 8 caractères au minimum' +
                  'parmi lesquels au moins, un chiffre, une majuscule un miniscule et un caractère spécial parmi [!%#_?@]' :
                  'Invalid password. there should be at least 8 characters ' +
                  'and at least one number, one capital and lower character, ' +
                  'and one no alphanumerique character among [!%#_?@]';
              return res.status(400).json({
                  'message': message
              });
          }
      }
    let userId;

    if (req.params.id) {
      userId = req.params.id;
    } else {
      userId = req.jwt.userId;
      if(req.body.state){
          console.log('you are not allowed to change the state : ' + userId);
          message = lang === "fr" ? "Vous n'avez pas les droits de modifier cette information" : "You are not allowed to change the state"
          return res.status(403).json({
              'message': message
          });
      }
    }
      particular = await particularService.updateParticular(userId, req.body);
    if (!particular) {
        message = lang === "fr" ? "Pas d'utilisateur trouvé avec l'id " + userId : 'particular not found  id ' + userId
        console.log('particular not found  id ' + userId);
        return res.status(404).json({
            'message': message
        });
    }
      message = lang === "fr" ? "Mise à jour du compte utilisateur" : 'particular was updated';
      console.log('particular was updated');
    // console.log(particular);
    return res.status(200).json({
      'message': message,
      'data': particular,
    });
  } catch (e) {
      console.log(e.message);
      const err = new error_processing.ServerError(e, lang);
      return res.status(500).json({
          'message': error_processing.process(err)
      });
  }
};

const deleteParticular = async (req, res) => {
    const lang = req.query.lang ? req.query.lang : 'en';
    let message;
  try {
    let userId;
    if (req.params.id) {
      userId = req.params.id;
    } else {
      userId = req.jwt.userId;
    }

    const state = await particularService.deleteParticular(userId);
    if (state) {
        message = lang === "fr" ? "Suppression du compte utilisateur avec l'id: " + userId : "the particular was deleted by id : " + userId
        console.log('the particular was deleted by id : ' + userId);
      return res.status(200).json({
        'message': message
      });
    } else {

        message = lang === "fr" ? "Aucun compte utilisateur n'a été trouvé" : 'No particular was found';
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
    createOpening : createOpening,
    getOpening :getOpening

};
