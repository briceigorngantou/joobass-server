const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tags = require('../../common/utils/enum').tags;

const experienceSchema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'particular',
            trim: true,
            required: [true, "employee's id field is required to create an experience "],
            index: true,
        },
        company: {
            type: String
        },
        title: {
            type: String,
            required: [true, "title field is required to create an experience "]
        },
        description: {
            type: String,
            required: [true, "description field is required to create an experience "]
        },
        tags: {
            type: [String],
            trim: true,
            default: [],
            enum: tags,
            required: [true, "At least one tag is field is required to create an experience "]
        },
        startDate: {
            type: Date,
            required: [true, "A start date field is required to create an experience "]
        },
        endDate: {
            type: Date,
            required: [true, "An end date field is required to create an experience "]
        },
        town: {
            type: String,
            required: [true, "town field is required to create an experience "]
        },
        registrationDate: {
            type: Date,
            default: Date.now()
        },
        isVisible: {
            type: Boolean,
            default: true
        }
    });

    module.exports = experienceSchema;