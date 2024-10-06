const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const file_tags = require('../../common/utils/enum').file_tags;

const metadatafileSchema = new Schema({
    state: {
        type: String,
        trim: true,
        enum: ['valid', 'invalid', 'rejected'],
        default: 'invalid',
        index: true
    },
    reason: {
        type: String,
        default: ""
    },
    name: {
        type: String,
        trim: true,
        required: [true, "name field is required to create a metadata "],
        unique: true,
        index: true
    },
    fileType: {
        type: String,
        required: [true, "filetype field is required to create a metadata "],
        enum: file_tags,
        default: 'profilePic',
        index: true
    },
    validity: {
        type: Date
    },
    owner: {
        type: Schema.Types.ObjectId,
        index: true
    },
    typeOwner: {
        type: String,
        enum: ["particular", "entreprise", "administrator"],
        index: true,
        default: "particular"
    },
    fileId: {
        type: Schema.Types.ObjectId,
        required: [false, "fileId field is required to create a metadata "]
    },
    createdAt: {
        type: Date
    },
    updateAt: {
        type: Date
    },
    bucketName: {
        type: String
    },
    bucketKey: {
        type: String
    }
});

metadatafileSchema.pre('save', function (next) {
    if (this.isNew) {
        this.createdAt = Date.now();
    }
    this.updateAt = Date.now();
    if (this.fileType === 'profilePic') {
        const d = new Date();
        const year = d.getFullYear();
        const month = d.getMonth();
        const day = d.getDay();
        this.validity = new Date(year + 1, month, day);
    }
    if (this.fileType === 'schoolLevel' || this.fileType === 'cv' || this.fileType === 'litigation' || this.fileType === 'other') {
        const d = new Date();
        const year = d.getFullYear();
        const month = d.getMonth();
        const day = d.getDay();
        this.validity = new Date(year + 50, month, day);
    }
    next();
});

module.exports = metadatafileSchema;