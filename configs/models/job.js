const mongoose = require('mongoose');
const jobSchema = require("../schemas/job");

module.exports = mongoose.model('job', jobSchema);
