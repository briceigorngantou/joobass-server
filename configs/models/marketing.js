const mongoose = require('mongoose');
const marketingSchema = require('../schemas/marketing');

module.exports = mongoose.model('marketing', marketingSchema);
