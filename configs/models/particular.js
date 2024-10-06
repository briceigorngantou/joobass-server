const mongoose = require('mongoose');
const particularSchema = require('../schemas/particular');

let Particular = mongoose.model('particular', particularSchema);
Particular.syncIndexes().then(function () {
    console.log("sync index done for Particular");
});

module.exports = Particular;
