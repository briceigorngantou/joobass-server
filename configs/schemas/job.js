const mongoose = require('mongoose');
const {strNoAccent} = require("../../common/utils/cleanDescription");
const {jobFilesRequired, stateJob, tags, contractType} = require("../../common/utils/enum");
const Schema = mongoose.Schema;
const { toCapitalize, createSlug} = require('../../common/utils/processing')

const jobSchema = new Schema(
    {
        registrationDate: {
            type: Date,
            default: Date.now()
        },
        affiliationCode:{
            type: String,
            trim: true,
            index: true
        },
        updateAt: {
            type: Date
        },
        town: {
            type: String,
            required: [true, "town field is required to create a job"],
            default: "A distance",
            index: true
        },
        street: {
            type: String,
            trim: true,
            index: true
        },
        referenceStreet: {
            type: String,
            trim: true
        },
        isHourDefined:{
            type: Boolean,
            default: true
        },
        geo_coordinates: {
            longitude: {
                type: Number,
                required: false
            },
            latitude: {
                type: Number,
                required: false
            }
        },
        title: {
            type: String,
            trim: true,
            required: [true, "xxxx field is required to create a job"],
            index: true
        },
        insuranceChecked:{
            type: Boolean,
            default: false
        },
        nbHiringSteps:{
            type: Number,
            default: 2
        },
        hiringDetails:{
            type: String,
            default: ''
        },
        jobFilesRequired:{
            type: [String],
            default: [],
            enum: jobFilesRequired
        },
        lastDateVisibility:{
            type: Date
        },
        description: {
            type: String,
            trim: true,
            required: [true, "title field is required to create a job "]
        },
        employer: {
            type: Schema.Types.ObjectId,
            required: [true, "employer's id field is required to create a job "]
        },
        state: {
            type: String,
            enum: stateJob,
            default: "created",
            index: true
        },
        isValid: {
            type: Boolean,
            default: false
        },
        nbplaces: {
            type: Number,
            min: 1,
            default: 1
        },
        nbPlacesLeft:{
           type: Number
        },
        startDate: {
            type: Date,
            required: [true, "A start date field is required to create a job "],
            index: true
        },
        endDate: {
            type: Date,
            required: [true, "An end date field is required to create a job "]
        },
        chooseCandidate: {
            type: Boolean,
            default: false
        },
        frequency: {
            isRegular: {
                type: Boolean,
                default: false
            },
            value_frequency:
                {
                    type: [
                        {
                            day: {
                                type: String,
                                required: [true, "A valid week of a day in job's frequency is required to create a job "],
                                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'saturday', 'friday', 'sunday']
                            },
                            timeSlots: [
                                {
                                    startHour: {
                                        type: String,
                                    },
                                    endHour: {
                                        type: String,
                                    },
                                }
                            ]
                        }
                    ]
                },
            listOfDates: {
                type: [
                    {
                        day:{
                            type: Date
                        },
                        timeSlots: [
                            {
                            startHour: {
                                type: String,
                            },
                            endHour: {
                                type: String,
                            },
                        }
                        ]
                    }
                ],
            }
        },
        employerPayment: {
            type: Number,
            required: [true, "Employer payment field is required to create a job"],
            min: 0
        },
        contractType: {
            type: String,
            enum: contractType,
            index: true
        },
        price: {
            type: Number,
            min: 0
        },
        prerequisites: {
            type: [String]
        },
        cv_required: {
            type: Boolean,
            default: false,
            required: [true, "cv_required field is required to create a job"],
            index: true
        },
        slug: {
            type: String,
            index: true,
            unique: true,
        },
        tags: {
            type: [String],
            required: [true, "tags field is required to create a job"],
            default: ['Others'],
            enum: tags,
            index: true
        },
        isPriceVisible: {
            type: Boolean,
            required: false,
            default: true
        },
        Views: {
            type: [
                {
                    idViewer: {
                        type: Schema.Types.ObjectId,
                        required: [true, "viewer's id field is required to create a job "],
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
        isPriceDefined: {
            type: Boolean,
            default: true
        },
        feesPaid: {
            type: Boolean,
            default: false
        },
        typeEmployer: {
            type: String,
            default: 'particular',
            enum: ['particular', 'entreprise']
        },
        reason: {
            type: String,
            default: ""
        },
        creation_is_assisted : {
                type: Boolean,
                default: false
        },
        validationInfos: {
            validationDate: {
                type: Date,
                default: null
            },
            validatorId: {
                type: Schema.Types.ObjectId,
                ref: 'administrator',
                trim: true,
                required: false,
                default: null
            }
        },
        packLevelId :{
            type: Schema.Types.ObjectId,
            ref: 'pack'
        },
        shares: {
            facebook: {
                type: Number,
                default: 0
            },
            linkedIn: {
                type: Number,
                default: 0
            },
            whatsApp: {
                type: Number,
                default: 0
            },
            twitter: {
                type: Number,
                default: 0
            }
        },
        sourceJobOffers: {
            typeSourceJobOffer: {
                type: String,
                enum: ["users", "external"],
                default: "users"
            },
            nameSourceJobOffer: {
                type: String,
                enum: ["jobinfocamer.com", "fnecm.org", "cameroondesks.com", "jobaas.cm"],
                default: "jobaas.cm"
            },
            urlSourceJobOffer: {
                type: String,
                default: null
            }
        },
        externalContactsJobOffer: {
            phoneNumber: {
                type: [String],
                default: []
            }, 
            emails: {
                type: [String],
                default: []
            },
            nameEmployer: {
                type: String,
                default: null
            },
            ExternalpublicationDate: {
                type: Date,
                default: Date.now()
            },
            isEmployerRegistered : {
                type: Boolean,
                default: false
        }
        },


    }
);

jobSchema.pre('save', function (next) {
    this.title = strNoAccent(this.title);
    this.title = this.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    this.title = this.title.replace(","," ");
    if (this.isNew) {
        this.registrationDate = Date.now();
        this.nbPlacesLeft = this.nbplaces;
        this.slug = !this.slug ? createSlug(this.title) : this.slug;
    } else {
        if (this.nbPlacesLeft === 0) {
            this.isValid = false;
        }
        if (this.state === 'validated') {
            this.isValid = true;
        }else{
            this.isValid = false;
        }
    }
    if (this.isPriceDefined === false) {
        this.price = 0;
    }
   if(!this.lastDateVisibility){
       const date = new Date();
       this.lastDateVisibility = new Date(date.setMonth(date.getMonth()+1));
   }
    this.updateAt = Date.now();
    if (this.street) {
        this.street = this.street.toLowerCase();
        this.street = this.street.replace('&#x27', '');
        this.street = this.street.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }
    if (this.town) {
        this.town = this.town.toLowerCase();
        this.town = this.town.replace('&#x27', '');
        this.town = this.town.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        this.town = strNoAccent(this.town);
    }
    this.title = this.title.replace(/\s\s+/g, ' ');
    this.title = toCapitalize(this.title);

    next();
});

module.exports = jobSchema;