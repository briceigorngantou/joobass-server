const mongoose = require('mongoose');

const tags = require('../../common/utils/enum').tags;
const origin_tags = require('../../common/utils/enum').origin_tags;
const type = require('../../common/utils/type');
const type_client = require("../../common/utils/enum").type_client;
const Schema = mongoose.Schema;

const companySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Representative's name field is required to create a company account "],
            validate: {
              validator: function(arr) {
                return typeof(arr) === 'string';
              },
              description: "Nom du représentant de l'entreprise"
            }
        },
        surname: {
            type: String
        },
        birthday: {
            type: Date
        },
        gender: {
            type: String,
            default: "Man",
            enum: ["Man", "Woman"]
        },
        class_client: {
            type: String,
            default: "Small",
            enum: ["Small", "Medium", "Big"]
        },
        phoneNumber: {
            value: {
                type: Number,
                unique: true,
                required: [true, "phonenumber field is required to create a company account "],
                trim: true
            },
            valid: {
                type: Boolean,
                default: false
            },
            requestId: {
                type: Number
            },
            requestIdExpired: {
                type: Date
            }
        },
        email: {
            value: {
                type: String,
                unique: true,
                required: [true, "email field is required to create a company account "],
                trim: true,
                index: true,
                lowercase: true
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        type_client: {
            type: String,
            trim: true,
            required: [true, "type_client field is required to create a company account "],
            default: 'new',
            enum: type_client
        },
        imageUrl: {
            url: {
                type: String
            },
            bucketName: {
                type: String,
                default: ""
            },
            bucketKey: {
                type: String,
                default: "Unknown"
            }
        },
        password: {
            type: String
        },
        agentRole:{
            type: String
        },
        random_code_for_processes:type.random_code_for_processes ,
        nameCompany: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, "Company's name field is required to create a company account "],
            index: true
        },
        referenceStreetCompany:{
            type: String
        },
        description: {
            type: String,
        },
        phoneNumberCompany: {
            value: {
                type: Number,
                trim: true,
                unique: true,
                index: true,
                sparse: true
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        fiscalNumber: {
            value: {
                type: String,
                unique: true,
                trim: true,
                index: true,
                uppercase: true,
                sparse: true
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        MoneyAccount: {
            type: [Number]
        },
        valid: {
            type: Boolean,
            default: false,
        },
        registrationDate: {
            type: Date,
            default: Date.now()

        },
        country: {
            type: String,
            required: [true, "country field is required to create a particular account "],
            lowerCase: true
        },
        town: {
            type: String,
            lowercase: true
        },
        street: {
            type: String,
            lowercase: true
        },
        geo_coordinates: type.geo_coordinates,
        profilePic: {
            url: {
                type: String
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        identityCard: {
            url: {
                type: String
            },
            valid: {
                type: Boolean,
                default: false
            },
            bucketName: {
                type: String,
                default: ""
            },
            bucketKey: {
                type: String,
                default: "Unknown"
            }
        },
        website: {
            value: {
                type: String
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        linkedin: {
            value: {
                type: String
            },
            valid: {
                type: Boolean,
                default: false
            }
        },
        tags: {
            required: true,
            type: [String],
            trim: true,
            default: [],
            enum: tags
        },
        validationToken: {
            token: String,
            date: Date
        },
        origin: {
            type: String,
            enum: origin_tags
        },
        affiliation: type.affiliation,
        updateAt: {
            type: Date
        },
        lastConnection: {
            type: Date
        },

        isNotified: {
            type: Boolean,
            default: true
        },

        creation_is_assisted : {
                type: Boolean,
                default: false
        },

    });

companySchema.pre('save', function (next) {
    if (this.isNew) {
        if (!this.profilePic.url) {
            if (this.gender === "Man") {
                this.profilePic.url = 'https://res.cloudinary.com/jobaas-files/image/upload/v1596616147/jobaas/man_y16ogs.png';
            } else {
                this.profilePic.url = 'https://res.cloudinary.com/jobaas-files/image/upload/v1596616151/jobaas/female_sr4iq1.png';
            }
        }
        if(!this.imageUrl.url){
            this.imageUrl.url = "https://res.cloudinary.com/jobaas-files/image/upload/v1628750151/jobaas/logo_company_gcmlyh.png"
        }
    } else {
        if (this.isModified('phoneNumber.value')) {
            this.phoneNumber.valid = false;
        }
    }
    next();
});

module.exports = companySchema;