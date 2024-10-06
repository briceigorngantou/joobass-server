const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statsEmployeeSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: [true, "userId field is required to create a statEmployee document"],
            unique: true
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        nbApplications: {
            type: Number,
            required: [true, "nbApplications field is required to create a statEmployee document"],
            min: 0,
            default: 0
        },
        nbJobDone: {
            type: Number,
            required: [true, "nbJobDone field is required to create a statEmployee document"],
            min: 0,
            default: 0
        },
        nbJobSucceed: {
            type: Number,
            required: [true, "nbJobSucceed field is required to create a statEmployee document"],
            min: 0,
            default: 0
        },
        nbJobFailed: {
            type: Number,
            required: [true, "nbJobFailed field is required to create a statEmployee document"],
            min: 0,
            default: 0
        },
        nbJobCancelled: {
            type: Number,
            required: [true, "nbJobCancelled field is required to create a statEmployee document"],
            min: 0,
            default: 0
        },
        meanRating: {
            type: Number,
            required: [true, "meanRating field is required to create a statEmployee document"],
            min: -1,
            default: 0
        },
        nbEvaluations: {
            type: Number,
            required: [true, "nbEvaluations field is required to create a statEmployee document"],
            min: 0,
            default: 0
        },
        nbSms: {
            type: Number,
            min: 0,
            default: 0
        }
    }
);

module.exports = mongoose.model('employeestats', statsEmployeeSchema);
