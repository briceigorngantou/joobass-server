const create = require('./loggerFactory');

// our config which we will populate shortly
const loggerTransports = [
    {
        type: 'console',
        // specify options here
        options: {}
    },
    {
        type: 'logsene',
        options: {
            token: '14518b95-443d-41ee-b2e4-06c228b72d30',
            level: 'debug',
            type: 'app_logs',
            url: 'https://logsene-receiver.eu.sematext.com'
        }
    }
];

module.exports = create(loggerTransports);
