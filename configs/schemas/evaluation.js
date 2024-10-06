const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const evaluationSchema = new Schema(
    {
        evaluator: {
            type: Schema.Types.ObjectId,
            required: [true, "evaluator's id field is required to create an evaluation "]
        },
        evaluated: {
            type: Schema.Types.ObjectId,
            required: [false, "evaluated's id field is required when evaluating a jober"]
        },
        job: {
            type: Schema.Types.ObjectId,
            ref: 'job',
            required: [true, "Job's id field is required to create an evaluation "]
        },
        netPromoterScore: {
            type: Number,
            min: 0,
            max: 10,
            required: [false, "netPromoterScore field is required to create an evaluation "]
        }        
        ,
        serviceGrade: {
            type: Number,
            min: 0,
            max: 10,
            required: [true, "serviceGrade field is required to create an evaluation "]
        },
        joberGrade: {
            type: Number,
            min: 0,
            max: 10,
            required: false
        },
        comment: {
            type: String,
            trim: true
        },
        evaluationDate: {
            type: Date,
            default: Date.now()
        },
        typeEvaluator: {
            type: String,
            default: 'particular',
            enum: ['particular', 'entreprise']
        },
        typeEvaluated: {
            type: String,
            default: 'particular',
            enum: ['particular', 'entreprise']
        },
        typeEvaluation: {
            type: String,
            default: 'employee',
            enum: ['employee', 'employer']

        },
        isVisible: {
            type: Boolean,
            default: true
        }
    },
);

module.exports = evaluationSchema;