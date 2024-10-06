const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schoolLevelAdmin = require('../../common/utils/enum').schoolLevelAdmin;
const reasons = require('../../common/utils/enum').reasons_random_code;

const adminSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, "name field is required to create an administrator account"]
        },
        profession: {
            type: String,
            trim: true,
            uppercase: true
        },
        surname: {
            type: String,
            trim: true,
            required: [true, "surname field is required to create an administrator account "],
        },
        gender: {
            type: String,
            required: [true, "gender field is required to create an administrator account "],
            enum: ["Man", "Woman"]
        },
        phoneNumber: {
            value: {
                type: Number,
                unique: true,
                required: [true, "phoneNumber field is required to create an administrator account"],
                trim: true,
                index: true,
                sparse: true
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        email: {
            value: {
                type: String,
                unique: true,
                required: [true, "email field is required to create an administrator account "],
                lowerCase: true,
                trim: true,
                index: true,
                sparse: true
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        valid: {
            type: Boolean,
            default: false
        },
        registrationDate: {
            type: Date,
            default: Date.now()
        },
        schoolLevel: {
            level: {
                type: String,
                lowerCase: true,
                enum: schoolLevelAdmin
            },
            diplomaYear: {
                type: Number
            }
        },
        profilePic: {
            url: {
                type: String
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        password: {
            type: String,
            required: [true, "password field is required to create an administrator account "]
        },
        random_code_for_processes : {
            type: [
                {
                    value: {
                        type:Number,
                        default: null,
                    },
                    generatedAt: {
                        type:Date
                    },
                    cause: {
                        type:String,
                        enum: reasons
                    },
                    requestId: {
                        type: String
                    }
                }
            ],
            default: []
        },
        town: {
            type: String,
            required: [true, "town field is required to create an administrator account "]
        },
        street: {
            type: String,
            required: [true, "street field is required to create an administrator account "]
        },
        referenceStreet: {
            type: String
        },
        state: {
            type: [String],
            trim: true,
            lowercase: true,
            enum: ['admin', 'supAdmin', 'controller', 'rh', 'commercial', 'communication'],
            default: []
        },
        birthday: {
            type: Date,
            required: [true, "birthday date field is required to create an administrator account "]
        },
        validationToken: {
            token: String,
            date: Date
        }
    }
);

module.exports = adminSchema;