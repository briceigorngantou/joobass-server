const smsService = require("../services/sms");
const error_processing = require('../common/utils/error_processing');


const sendSms = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const sms = await smsService.send_notification(req.body);
        return res.status(200).json({
            'data': sms
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
    sendSms: sendSms
};

