const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "name field is required to create a tag"],
            unique: true
        }
    },
);

module.exports = tagSchema;