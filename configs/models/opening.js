const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const openingSchema = new Schema(
    {
        targetUrl: {
            type: String,
            trim: true,
            required: [true, "targetUrl field is required to create an opening "],
        },
        idTarget: {
            type: String,
            trim: true
        },
        targetType: {
            type: String,
            trim: true,
            lowercase: true,
        },
        nbViews: {
            type:  Number,
            default:0
        },
        targetUser: {
            type: Schema.Types.ObjectId,
            trim: true
        },
        shortId: {
            type: String
        },
        media: {
            type: String,
        },
        registrationDate: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date
        },
        Views: {
            type: [
                {
                    dateView: {
                        type: Date,
                        default: Date.now()
                     }
                }
            ]
        }

    }
);



Opening = mongoose.model('opening', openingSchema);
Opening.syncIndexes().then(function () {
    console.log("sync index done for opening");
});

module.exports = Opening;
