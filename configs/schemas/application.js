const mongoose = require('mongoose');
const vehicles = require('../../common/utils/enum').vehicles;
const Schema = mongoose.Schema;
const stateApplication = require('../../common/utils/enum').stateApplication;
const schoolLevel = require('../../common/utils/enum').schoolLevel;
const driver_category = require('../../common/utils/enum').driver_category;

const applicationSchema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'particular',
            trim: true,
            required: [true, "employee's id field is required to create an application to a job "],
            index: true,
        },
        job: {
            type: Schema.Types.ObjectId,
            ref: 'job',
            trim: true,
            required: [true, "job's id field is required to create an application to a job "],
            index: true,
        },
        applicationDate: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date
        },
        state: {
            type: String,
            enum: stateApplication,
            default: 'done',
            required: [true, "state field is required to create an application to a job "]
        },
        motivations: {
            type: String,
            trim: true,
            required: [true, "motivation field is required to create an application to a job "],
            default: 'motivations'
        },
        cv: {
            url: {
                type: String,
                default: "undefined"
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        portfolio: {
            url: {
                type: String,
                "default": "undefined"
            },
            valid: {
                type: Boolean,
                default: false
            }
        },        
        identity_card: {
            url: {
                type: String,
                default: "undefined"
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        driver_permit: {
            vehicle: {
                type: String,
                enum: vehicles
            },
            url: {
                type: String,
                default: "undefined"
            },
            date: {
                type: Date,
            },
            category: {
                type: String,
                enum: driver_category
            },
            verified: {
                type: Boolean,
                default: false,
            }
        },
        school_level: {
            level: {
                type: String,
                enum: schoolLevel
            },
            diplomaYear: {
                type: Number
            },
            url: {
                type: String,
                default: "undefined"
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        Views: {
            type: [
                {
                    idViewer: {
                        type: Schema.Types.ObjectId,
                        required: [true, "viewer's id field is required to create an application to a job "],
                    },
                    dateView: {
                        type: Date,
                        default: Date.now()
                    }
                }
            ]
        },
        nbViews: {
            type: Number,
            default: 0,
            min: 0
        },
        reason: {
            type: String,
            trim: true,
            default: ''
        },
        creation_is_assisted : {
                type: Boolean,
                default: false
        }
    },
);

module.exports = applicationSchema;