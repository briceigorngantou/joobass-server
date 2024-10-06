/** *******
 * dev.js
 *********/ 

const envConfig = {
    hostname: process.env.IP,
    port: process.env.PORT || 4000,
    modeTest: process.env.MODE_TEST || 0,
    databaseUri: process.env.DATABASE_URI ,
    databaseName: 'jobaas',
    populateDatabase: process.env.POPULATE_DATABASE || true,
    IP_ADMIN: ['93.24.110.45'],
    API_KEY_GOOGLE_MAP: '',
    jwt_secret: process.env.JWT_SECRET,
    sr: process.env.SR || 12,
    jwt_expiration_in_seconds: process.env.EXPIRE_TIME || 86400,
    rate_limit_in_milliseconds: process.env.RATELIMITER_TIME || 300000,
    rate_block_limit_seconds: process.env.RATEBLOCKLIMITER_TIME || 180,
    no_mail: process.env.NO_MAIL || 1,
    job_price_min: process.env.JOB_PRICE_MIN || 0,
    payment_type_fees: process.env.PAYMENT_TYPE_FEES || 300,
    no_sms: process.env.NO_SMS || 1,
    user_api_sms: process.env.USER_API_SMS,
    password_api_sms: process.env.PASSWORD_API_SMS,
    prerender: process.env.PRERENDER,
    phonenumbers: 690637982,
    twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
    twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
    twilio_virtual_number: '+17243902719',                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    redis_url: process.env.REDIS_URL,
    permissionLevels: {
        'EMPLOYER_USER': 5,
        'EMPLOYEE_USER': 7,
        'ENTREPRISE_USER': 10,
        'ADMIN': 2048,
        'CONTROLLER_USER': 777,
        'SUP_ADMIN': 1468,
        'RH_USER': 888,
        'COMMERCIAL_USER': 666,
        'COMMUNICATION_USER': 666
    },
    mailgun_apikey: process.env.MAILGUN_API_KEY,
    mailgun_domain: process.env.MAILGUN_DOMAIN,
    mailgun_host: process.env.MAILGUN_HOST,
    cto_mail: process.env.CTO_MAIL,
    it_mails: process.env.IT_MAILS ,
    marketing_mails: process.env.MARKETING_MAILS,
    logsene_token: process.env.LOGSENE_TOKEN,
    exception_transaction_process: process.env.EXCEPTION_TRANSACTION || Number('0'),
    bucketName: "jobaas-files-dev"
};

module.exports = envConfig;
