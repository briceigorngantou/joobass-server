// require in our libraries we have just installed
const winston = require('winston');
const logsene = require('winston-logsene');
const {createLogger, format, transports, config_log} = require('winston');


function createConsoleTransport(options) {
    return new (winston.transports.Console)(options);
}

function createLogseneTransport(options) {
    return new logsene(options);
}


// we pass this function an array of transport objects
// each transport object has 2 properties: type & options
function getLoggerTransports(transports) {
    return transports.map((transport) => {
        const {type, options} = transport;

        switch (type) {
            case 'console':
                return createConsoleTransport(options);
            case 'logsene':
                return createLogseneTransport(options);
        }
    });
}

// our export function which will be invoked by our singleton
module.exports = function create(transports) {
    return createLogger({
        transports: getLoggerTransports(transports),
        levels: require('winston').config.npm.levels,
        format: format.simple()
    });
};
