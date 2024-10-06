const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const type_event = require('../../common/utils/enum').type_event;
const typeEventSession = require('../../common/utils/enum').typeEventSession;
const typeObjectOfEvent = require('../../common/utils/enum').typeObjectOfEvent;


const sessionEventSchema = new Schema(
    {
        typeUser : {
            type: String,
            required: true,
            enum : ["company", "particular"]
        },
        sessionId: {
            type: String,
            required: [true, "A valid uuid v4 code is required to create a session events document"],
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            trim: true,
            required: [true, "user's id field is required to create a session events document "],
            index: true
        },
        events: {
            type: [
                {
                    eventSession: {
                        type: String,
                        enum: typeEventSession,
                        required: true
                    },
                    BusinessObject: {
                        type: String,
                        enum: typeObjectOfEvent,
                        required: true
                    },
                    BusinessObjectId: {
                        type: Schema.Types.ObjectId,
                        required: [true, "user's id field is required to create a session events document"],
                    },
                    dateEvent: {
                        type: Date,
                        required: true
                    }
                }
            ],
            default: []
        },
        startDateSession: {
            type: Date,
            default: Date.now(),
        },
        endDateSession: {
            type: Date,
            default: null,
        }
    },
);

module.exports = mongoose.model('sessionevent', sessionEventSchema);
