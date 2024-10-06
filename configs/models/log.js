const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, "name field is required to create a log "],
        }
        ,
        startDate: {
            type: Date,
            required: [true, "a start date field is required to create a log "]
        },
        endDate: {
            type: Date,
            default: Date.now()
        },
        status: {
            type:  Number,
            required: [true, "an end date field is required to create a log "],
        },
        sends: {
            type:{
                sms: {
                    type: {
                        succes: {type: Number, default: 0},
                        fails: {type: Number, default: 0}
                    }
                },
                emails: {
                    type: {
                        succes: {type: Number, default: 0},
                        fails: {type: Number, default: 0}
                    }
                },
                notfications: {
                    type: {
                        succes: {type: Number, default: 0},
                        fails: {type: Number, default: 0}
                    }
                },
            }
        },
        info: {
            type:  String,

        },
        warning: {
            type:  String,

        },
        error: {
            type: String,

        },

        targetUser: {
            type: Schema.Types.ObjectId,
            trim: true
        },
        registrationDate: {
            type: Date,
            default: Date.now()
        }

    }
);



Log  = mongoose.model('log', logSchema);
Log.syncIndexes().then(function () {
    console.log("sync index done for Log");
});

module.exports = Log;
