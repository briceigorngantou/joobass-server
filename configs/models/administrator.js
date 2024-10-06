const mongoose = require('mongoose');
const adminSchema = require('../schemas/administrator');

module.exports = mongoose.model('administrator', adminSchema);
