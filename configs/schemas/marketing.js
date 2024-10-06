const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const marketingSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: [true, "userId field is required to create a marketing document "]
        },
        origin: {
            type: String,
            required: [true, "An origin field is required to create a marketing document "],
            default: "Undefined"
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
    }
);

module.exports = marketingSchema;