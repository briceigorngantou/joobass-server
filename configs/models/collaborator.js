const mongoose = require('mongoose');
const collaboratorSchema = require('../schemas/collaborator');

module.exports = mongoose.model('collaborator', collaboratorSchema);