const mongoose = require('mongoose');
const companySchema = require('../schemas/company');

let Company = mongoose.model('company', companySchema);
Company.syncIndexes().then(function () {
    console.log("sync index done for Company");
});
module.exports = Company;
