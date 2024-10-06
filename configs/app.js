/** *******
 * app.js file
 *********/

const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const xss = require('xss-clean');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const nocache = require('nocache');
const routes = require('../routes');
const NodeCache = require( "node-cache" );
const { createAgent } = require('@forestadmin/agent');
const { createMongooseDataSource } = require('@forestadmin/datasource-mongoose');
const mongooseConnection = require('./forestAdminConfig');
const mongoose = require('mongoose');

module.exports = function () {
  const server = express();
  const myCache = new NodeCache();

  const create = async(config) => {
    // set all the server things
    server.set('env', config.env);
    server.set('port', config.port);
    server.set('hostname', config.hostname);
    server.set('etag', false);

    server.engine('.html', require('ejs').renderFile);
    server.set('view engine', 'html');
    server.set('views', path.join(__dirname, '../common/views'));
    
   console.log("mode test : " + Number(config.modeTest));
      
    if(config.env === './production'){
      server.use(require('prerender-node').set('prerenderToken', config.perender));
    }
    // adding morgan to log HTTP requests
    server.use(morgan('combined'));
    // add middleware to parse the json and files chunks
//    server.use(busboy());
    server.use(bodyParser.json({
      limit: '10MB',
    }));
    server.use(bodyParser.urlencoded({
      extended: false,
    }));
//    server.use(busboyBodyParser());
      //Add statics
      server.use(express.static('react-app/build'));
    // adding Helmet to enhance API's security
      server.use(helmet());
    //NoSql injection
      server.use(mongoSanitize());
      server.use(mongoSanitize({
          replaceWith: '_'
      }));
      //sanitize
      //xss attack
      server.use(xss());
      server.use(nocache());
    server.disable('view cache');
    // add enable cors origin
    server.use((req, res, next) => {
      if(config.env === './production'){
          const allowedOrigins = ['https://www.jobaas.cm', 'https://www.jobaas.fr',
            'https://jobaas-backoffice.herokuapp.com']
          const origin = req.headers.origin;
          if(allowedOrigins.indexOf(origin) > -1){
            res.setHeader('Access-Control-Allow-Origin', origin);
          }
      }else{
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      // authorized headers for preflight requests
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
      next();
    });
      server.use(compression());
    routes.init(server);
  };

  const start = (databaseUri) => {
    const hostname = server.get('hostname');
    const port = server.get('port');
      console.log(' There is the port :   ' + port);
      //logger.info(' There is the port :   ' + port);
    mongoose.connect(databaseUri, {
      connectTimeoutMS: 1500,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).then(
        () => {
          console.log('connected to ' + databaseUri);
          //logger.info('connected to ' + databaseUri);
            server.listen(port, '0.0.0.0', function () {
              let mailLink = hostname === 'localhost' ? 'http://' + hostname + ':' + port : 'https://' + hostname;
              console.log('Express server listening on - ' + mailLink);
              myCache.flushAll();
              //logger.info('Express server listening on - ' + mailLink);
          });
        },
        (err) => {
          console.log(err.message);
          //logger.error(err.message)
        },
    );
    return server;
  };
  return {create: create, start: start};
};
