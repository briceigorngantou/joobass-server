/** *****
 * server.js file
 ********/
let server = require('./configs/app')();
const config = require('./configs/environnement/config');


// create the basic server setup
server.create(config);

// start the server
server = server.start(config.databaseUri);
module.exports = server;
