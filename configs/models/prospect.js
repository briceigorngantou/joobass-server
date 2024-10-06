const mongoose = require('mongoose');
const type_prospect = require("../../common/utils/enum").type_prospect;
const Schema = mongoose.Schema;

const prospectSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, "name field is required to create a prospect "]
        },
        surname: {
            type: String,
            trim: true,
            uppercase: true,
            require: true
        },
        town: {
            type: String,
            trim: true,
            required: [true, "town field is required to create a prospect "],
            uppercase: true
        },
        gender: {
            type: String,
            trim: true,
            required: [true, "gender field is required to create a prospect "],
            enum: ['Man', 'Woman']
        },
        phoneNumber: {
            type: Number,
            unique: true,
            required: [true, "phoneNumber field is required to create a prospect "],
            trim: true,
            index: true
        },
        email: {
            type: String,
            unique: true,
            required: false,
            lowerCase: true,
            trim: true
        },
        message: {
            type: String,
            required: false,
        },
        date_creation : {
            type: Date,
            default: Date.now()
        },
        type_prospect : {
            type: String,
            trim: true,
            required: false,
            enum: type_prospect
        }
    });

module.exports = mongoose.model('prospect', prospectSchema);
