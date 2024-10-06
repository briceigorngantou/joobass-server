const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statsEmployerSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: [true, "userId field is required to create a statEmployer document"],
            unique: true
        },
        nbJobCreated: {
            type: Number,
            required: [true, "nbJobCreated field is required to create a statEmployer document"],
            min: 0,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        nbJobValidated: {
            type: Number,
            required: [true, "nbJobValidated field is required to create a statEmployer document"],
            min: 0,
            default: 0
        },
        nbJobDeleted: {
            type: Number,
            required: [true, "nbJobDeleted field is required to create a statEmployer document"],
            min: 0,
            default: 0
        },
        meanRating: {
            type: Number,
            required: [true, "meanRating field is required to create a statEmployer document"],
            min: 0,
            default: 0
        },
        totalEmployees: {
            type: Number,
            required: [true, "totalEmployees field is required to create a statEmployer document"],
            min: 0,
            default: 0
        },
        nbEvaluations: {
            type: Number,
            required: [true, "xxxx field is required to create a statEmployer document"],
            min: 0,
            default: 0
        }
    }
);

module.exports = mongoose.model('employerstats', statsEmployerSchema);
