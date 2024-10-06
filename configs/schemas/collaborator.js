const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const domainCollaborators = require('../../common/utils/enum').domainCollaborators;
const collaboratorStatus = require('../../common/utils/enum').collaboratorStatus;

const collaboratorSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, "name field is required to create a new employee in the records"]
        },
        profession: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, "the profession name is a field required to create a new employee in the records"]
        },
        status: {
            type: String,
            trim: true,
            enum : collaboratorStatus,
            required: [true, "the position name is a field required to create a new employee in the records"]
        },
        surname: {
            type: String,
            trim: true,
            required: [true, "surname field is required to create a new employee in the records "],
        },
        gender: {
            type: String,
            required: [true, "gender field is required to create a new employee in the records "],
            enum: ["Man", "Woman"]
        },
        phoneNumber: {
            value: {
                type: Number,
                unique: true,
                required: [true, "phoneNumber field is required to create a new employee in the records"],
                trim: true,
                index: true,
                sparse: true
            }
        },
        email: {
            value: {
                type: String,
                unique: true,
                required: [true, "email field is required to create a new employee in the records "],
                lowerCase: true,
                trim: true,
                index: true,
                sparse: true
            }
        },
        registrationDate: {
            type: Date,
            default: Date.now()
        },
        town: {
            type: String,
            required: [true, "town field is required to create a new employee in the records "]
        },
        street: {
            type: String,
            required: [true, "street field is required to create a new employee in the records "]
        },
        country: {
            type: String,
            required: [true, "country field is required to create a new employee in the records "]
        },
        referenceStreet: {
            type: String
        },
        Domaine: {
            type: String,
            required: true,
            enum: domainCollaborators
        },
        birthday: {
            type: Date,
            required: [true, "birthday date field is required to create a new employee in the records "]
        },
        startDateInCompany: {
            type: Date,
            required: [true, "StartDateInCompany date field is required to create a new employee in the records "]
        },
        endDateInCompany: {
            type: Date
        },
        isPaid: {
            type: Boolean,
            required: [true, "isPaid field is required to create a new employee in the records"],
            default: true
        },
        monthlyWage: {
            type: Number,
            required: [true, "wage field is required to create a new employee in the records"],
            default: 0
        },
        currency: {
            type: String,
            enum: ["XAF", "EUR"],
            required: true,
            default: "XAF"
        },
        avantages: {
            type: String,
        },

    }
);

module.exports = collaboratorSchema;