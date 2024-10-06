const mongoose = require('mongoose');
const metadatafileSchema = require('../schemas/metadatafile');

Metadatafile = mongoose.model('metadatafile', metadatafileSchema);
Metadatafile.syncIndexes().then(function () {
    console.log("sync index done for Metadatafiles ");
});
module.exports = Metadatafile;

