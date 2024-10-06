const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const type_event = require('../../common/utils/enum').type_event;

const notificationSchema = new Schema(
    {
        receiver: {
            type: Schema.Types.ObjectId,
            trim: true,
            required: [true, "receiver's id field is required to create a notification "],
            index: true
        },
        text: {
            type: String,
            trim: true,
            required: [true, "text field is required to create a notification "],
        },
        type_event: {
            type: String,
            enum: type_event
        },
        date_event: {
            type: Date,
            default: Date.now(),
        },
        notifUrl: {
            type: String,
            required: [true, "notifUrl field is required to create a notification "]
        },
        readState: {
            type: Boolean,
            default: false
        },
        notifPic: {
            type: String,
            default: "https://res.cloudinary.com/jobaas-files/image/upload/v1660564763/jobaas/bell-g39ca08643_1280_iqqb6h.png"
        }
    },
);

module.exports = mongoose.model('notification', notificationSchema);
