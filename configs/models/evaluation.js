const mongoose = require('mongoose');
const evaluationSchema = require('../schemas/evaluation');

module.exports = mongoose.model('evaluation', evaluationSchema);
