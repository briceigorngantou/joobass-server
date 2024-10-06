const mongoose = require('mongoose');
const experienceSchema = require('../schemas/experience');

Experience = mongoose.model('experience', experienceSchema);
module.exports = Experience;
