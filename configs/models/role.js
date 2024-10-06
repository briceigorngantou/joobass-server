const mongoose = require('mongoose');
const {profileType} = require("../../common/utils/enum");
const Schema = mongoose.Schema;

//TODO ADAPT CODE TO ADD THE USERTYPE
const roleSchema = new Schema(
    {
        userId: {
            type: String,
            trim: true,
            required: [true, "userId field is required to create a role "],
        },
        permissionLevel: {
            type: [Number],
            default: [1],
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        userType: {
            type: String,
            required: false,
            index: true,
            sparse: true,
            enum: profileType
        }
    },
);

module.exports = mongoose.model('role', roleSchema);
