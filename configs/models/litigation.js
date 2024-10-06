const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const stateLitigation = require('../../common/utils/enum').stateLitigation;

const litigationSchema = new Schema(
    {
        job: {
            type: Schema.Types.ObjectId,
            ref: "job",
            required: [true, "job's id field is required to create a litigation "]
        },
        employer: {
            type: Schema.Types.ObjectId,
            required: [true, "employer's id field is required to create a litigation "],
            index: true
        },
        employee: {
            type: Schema.Types.ObjectId,
            required: [true, "employee's id field is required to create a litigation "],
            index: true
        },
        receiptDate: {
            type: Date
        },
        updateAt: {
            type: Date
        },
        description: {
            type: String,
            required: [true, "description's id field is required to create a litigation "]
        },
        state: {
            type: String,
            trim: true,
            enum: stateLitigation,
            default: "in progress"
        },
        receiver: {
            type: String,
            enum: ["employee", "employer"],
            default: 'employee'
        }
    }
);

module.exports = mongoose.model('litigation', litigationSchema);
