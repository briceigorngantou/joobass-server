const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const stateContract = require('../../common/utils/enum').stateContract;

const contractSchema = new Schema(
    {
        employer: {
            type: Schema.Types.ObjectId,
            required: [true, "employer's id field is required to create a contract "],
            index: true
        },
        job: {
            type: Schema.Types.ObjectId,
            ref: 'job',
            required: [true, "job's id field is required to create a contract "],
            index: true
        },
        nbTransactionsDone: {
            type: Number,
            required: [true, "nbTransactionsDone field is required to create a contract "],
            min: 0,
            default: 0
        },
        nbTransactionsTodo: {
            type: Number,
            required: [true, "nbTransactionsTodo field is required to create a contract "],
            min: 1,
            default: 1
        },
        state: {
            type: String,
            required: [true, "state field is required to create a contract "],
            default: 'in_progress',
            enum: stateContract
        },
        registrationDate: {
            type: Date,
            default: Date.now()
        },
        paymentPerTransaction: {
            type: Number,
            required: false,
            min: 1,
            default: 1
        },
        employeePaid: {
            type: Boolean,
            required: false,
            index: true
        },
        updateAt: {
            type: Date
        },
    }
);

contractSchema.pre('save', function (next) {
    if (this.isNew) {
        this.registrationDate = Date.now();
    }
    if (this.nbTransactionsDone === 1) {
        this.state = 'in_progress'
    }
    this.updateAt = Date.now();
    next();
});

module.exports = mongoose.model('contract', contractSchema);
