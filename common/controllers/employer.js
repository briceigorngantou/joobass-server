// services
const fs = require('fs');
const path = require('path');
const smsService = require('../../services/sms');
const error_processing = require('../utils/error_processing');
const particularService = require('../../services/particular');
const sms = require('../../services/sms');
const _ = require('lodash');
const config = require('../../configs/environnement/config');
const no_sms =  config.no_sms;
const no_mail =  config.no_mail;

const email_sender = require('../../services/email_sender');


//update the field isNotified from entity type : particular/company

const updateNotify = async (req, res) => {
    let smsNotification ;
    console.log('update notify process');
    // TODO handle the case where it is a company
    let message;
    const lang = req.query.lang ? req.query.lang : 'en';
    try {
        let particular;

        let userId;

        if (req.params.id) {
            userId = req.params.id;
        } else {
            userId = req.jwt.userId;
            if( typeof req.body.isNotified === 'undefined'){
                console.log('you should provide the value of field isNotified : ' + userId);
                message = lang === "fr" ? "Vous devez fournir la valeur du champ isNotified" : "you should provide the value of field isNotified";
                return res.status(400).json({
                    'message': message
                });
            }
        }
        const  particularBeforeUpdate = await particularService.getParticular("id", userId);
        // IF new vallue of the field "isNotified" is the same that the old then bad request 
        if( req.body.isNotified  === particularBeforeUpdate.isNotified ){
            console.log('you should provide the value of field isNotified : ' + userId);
            message = lang === "fr" ? "Vous devez fournir  une valeur différente de la valeur actuelle pour le champ isNotified" : "you should provide a different value from the current one for  the  field 'isNotified'";
            return res.status(400).json({
                'message': message
            });
        }         

        particular = await particularService.updateParticular(userId, {isNotified: req.body.isNotified});

        if (!particular) {
            message = lang === "fr" ? "Pas d'utilisateur trouvé avec l'id " + userId : 'particular not found  id ' + userId;
            console.log('particular not found  id ' + userId);
            // Nofify by sms


            return res.status(404).json({
                'message': message
            });
        }
        const messageContent = "Vous avez choisi de ne plus être notifié de nouvelles annonce d'emplois de JOBAAS. Toutefois, vous pouvez réactiver les notifications depuis le site web jobaas.cm " ;

        if(  req.body.isNotified == false && particularBeforeUpdate.isNotified   && Number(no_sms) === 0  && particular.phoneNumber.valid == true){

                   
            smsNotification = {
                from: "JOBAAS",
                to: String(particular.phoneNumber.value),
                text: messageContent 
            };

            //console.log(smsText) ;
            smsStatus =   await smsService.send_notification(smsNotification);
        }

            

            if ( req.body.isNotified == false && particularBeforeUpdate.isNotified  && Number(no_mail) === 0 && particular.email.value) {



                let mailTemplate = fs.readFileSync(path.join(__dirname, "../../common/mails/unregistration_fr.html"), "utf8");
                mail = mailTemplate ;
                const  footer = fs.readFileSync(path.join(__dirname, "../../common/mails/footer.html"), "utf8");
                mail = mailTemplate.replace("#name", particular.surname);
                mail = mail.replace("#message", messageContent);
                mail = mail.replace("#footer", footer);

            await email_sender.nodemailer_mailgun_sender({
                "from": 'Jobaas <info@jobaas.cm>',
                "to": particular.email.value, "cc": "", "bcc": "",
                "subject": " Désactivation des notifications Jobaas",
                "html": mail,
                "text": ''
            });
            

        }
        message = lang === "fr" ? "Mise à jour du champ isNotified" : 'the field isNotified was updated';
        console.log('field isNotified was updated');
        // console.log(particular);
        return res.status(200).json({
            'message': message
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
    updateNotify : updateNotify
};
