const axios = require('axios');
const user = require('../configs/environnement/config').user_api_sms;
const password = require('../configs/environnement/config').password_api_sms;
//configs
const config = require('../configs/environnement/config');

const accountSid = config.twilio_account_sid;
const authToken = config.twilio_auth_token;
const virtual_number = config.twilio_virtual_number;
const client = require('twilio')(accountSid, authToken);

const send_notification = async (dataIn, isOnlyCameroon=false) => {
    console.log('call service sms  for  ' + dataIn['to'] + " size " + dataIn['text'].length);
    try {
        // if the input is empty or there is no phonenumber
        if (typeof dataIn === 'undefined' || !dataIn['to']) {
            return {"code": 0};
        }
        if (dataIn['to'].toString().startsWith("237")  ) {
           return  sendSmsAlphaSolution(dataIn);
        } else if( !isOnlyCameroon) {
           return  sendSmsTwilio(dataIn);
        }
        return 0;
    } catch (e) {
        console.log(e.message);
        return {"code": 0};
    }
};


const sendSmsAlphaSolution= async (dataIn) => {
    console.log('call service sms  for  ' + dataIn['to'] + " size " + dataIn['text'].length);
    try {
        // if the input is empty or there is no phonenumber
        if (typeof dataIn === 'undefined' || !dataIn['to']) {
            return {"code": 0};
        }
        let headers = {
            'Content-Type': 'application/json'
        };
        let number = dataIn['to'].toString().startsWith("237") ?
            dataIn['to'].toString().replace('237', '') : dataIn['to'];
        let body = {
            user: user,
            password: password,
            senderid: "Jobaas",
            sms: dataIn['text'],
                mobiles: number
            };
        const url_api = 'https://smsvas.com/bulk/public/index.php/api/v1/sendsms';
            let options = {
                url: url_api,
                method: 'POST',
                headers: headers,
                data: body
            };
            const result = await axios(options);
        console.log("service response code api sms : " + result.data.responsecode);
        console.log(result.data);
        return {"code": result.data.responsecode};
    } catch (e) {
        console.log(e.message);
        return {"code": 0};
    }
};


const sendSmsTwilio= async (dataIn) => {
    
    console.log('call service sms  for  ' + dataIn['to'] + " size " + dataIn['text'].length);
    try {
        // if the input is empty or there is no phonenumber
        if (typeof dataIn === 'undefined' || !dataIn['to']) {
            return {"code": 0};
        }

      client.messages
      .create({body: dataIn['text'], from: virtual_number, to: `+${dataIn['to']}`})
      .then(message => console.log(message.sid));

     return {"code": 1};
    } catch (e) {
        console.log(e.message);
        return {"code": 0};
    }
};



module.exports = {
    send_notification: send_notification,
};

