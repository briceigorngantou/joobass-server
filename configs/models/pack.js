const mongoose = require("mongoose");
const packSchema = require("../schemas/pack");

module.exports = mongoose.model('pack', packSchema);