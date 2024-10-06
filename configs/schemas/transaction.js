const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
    {
        emitter: {
            type: Schema.Types.ObjectId,
            required: [true, "emitter's id field is required to create a transaction"],
        },
        job: {
            type: Schema.Types.ObjectId,
            ref: 'job',
            required: [true, "job's id field is required to create a transaction"]
        },
        idCharge: {
            type: String,
            default: "action manuelle",
            required: [true, "idCharge field is required to create a transaction"]
        },
        urlMyCoolPay: {
            type: String
        },
        payment: {
            type: Number,
            min: 0,
            required: [true, "payment amount field is required to create a transaction"]
        },
        type: {
            type: String,
            enum: ['refund', 'fees'],
            default: 'fees'
        },
        state: {
            type: String,
            enum: ['validated', 'failed'],
            default: 'failed'
        },
        emissionDate: {
            type: Date,
            default: Date.now(),
        },
    },
);

module.exports = transactionSchema;