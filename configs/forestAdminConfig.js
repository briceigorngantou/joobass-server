const mongoose = require('mongoose');
const config = require('../configs/environnement/config');

const connection = mongoose.createConnection(config.databaseUri, {
    connectTimeoutMS: 1500,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });

const packSchema = require('./schemas/pack');
const adminSchema = require('./schemas/administrator');
const blogArticleSchema = require('./schemas/blogArticle');
const particularSchema = require('./schemas/particular');
const collaboratorSchema = require('./schemas/collaborator');
const jobSchema = require('./schemas/job');
const applicationSchema = require('./schemas/application');
const marketingSchema = require('./schemas/marketing');
const companySchema = require('./schemas/company');
const evaluationSchema = require('./schemas/evaluation');
const transactionSchema = require('./schemas/transaction');
const metadatafileSchema = require('./schemas/metadatafile');
const experienceSchema = require('./schemas/experience');

connection.model('administrator', adminSchema);
connection.model('blogarticle', blogArticleSchema);
connection.model('particular', particularSchema);
connection.model('pack', packSchema);
connection.model('collaborator', collaboratorSchema);
connection.model('marketing', marketingSchema);
connection.model('company', companySchema);
connection.model('job', jobSchema);
connection.model('evaluation', evaluationSchema);
connection.model('application', applicationSchema);
connection.model('transaction', transactionSchema);
connection.model('metadatafile', metadatafileSchema);
connection.model('experience', experienceSchema); 

module.exports = connection;