const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tags = require('../../common/utils/enum').tags;
const schoolLevel = require('../../common/utils/enum').schoolLevel;
const driver_category = require('../../common/utils/enum').driver_category;
const vehicles = require('../../common/utils/enum').vehicles;
const origin_tags = require('../../common/utils/enum').origin_tags;
const type_client = require("../../common/utils/enum").type_client;
const language_level = require('../../common/utils/enum').language_level;
const language = require('../../common/utils/enum').language;
const type = require('../../common/utils/type');

const particularSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            uppercase: true,
            required: [true, "name field is required to create a particular account "],
            index: true,
        },
        profession: {
            type: String,
            trim: true,
            uppercase: true,
            index: true,
        },
        surname: {
            type: String,
            trim: true,
            required: [true, "surname field is required to create a particular account "],
        },
        description: {
            type: String
        },
        gender: {
            type: String,
            required: [true, "gender field is required to create a particular account "],
            enum: ["Man", "Woman"]
        },
        MoneyAccount: {
            type: [Number]
        },
        phoneNumber: {
            value: {
                type: Number,
                unique: true,
                required: [true, "phoneNumber field is required to create a particular account "],
                trim: true,
                index: true,
                sparse: true
            },
            valid: {
                type: Boolean,
                default: false
            },
            requestId: {
                type: Number
            },
            requestIdExpired: {
                type: String
            }
        },
        type_client: {
            type: String,
            trim: true,
            required: [true, "type_client field is required to create a particular account "],
            default: 'new',
            enum: type_client
        },
        email: {
            value: {
                type: String,
                unique: true,
                required: [true, "email field is required to create a particular account "],
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
                enum: schoolLevel
            },
            diplomaYear: {
                type: Number
            },
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
        profilePic: {
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
        cv: {
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
        password: {
            type: String,
            required: [true, "password field is required to create a particular account "]
        },
        random_code_for_processes :type.random_code_for_processes ,
        skills: {
            type: [String]
        },
        country: {
            type: String,
            lowerCase: true
        },        
        town: {
            type: String,
            required: [true, "town field is required to create a particular account "],
            lowerCase: true
        },
        street: {
            type: String,
            lowercase: true,
        },
        geo_coordinates: type.geo_coordinates,
        referenceStreet: {
            type: String
        },
        language: {
            type: [
                {
                    value: {
                        type: String,
                        enum: language
                    },
                    level: {
                        type: String,
                        enum: language_level
                    }
                }
            ],
            default: []
        },
        software: {
            type: [String],
            default: []
        },
        driver_permit: {
            vehicle: {
                type: String,
                enum: vehicles
            },
            url: {
                type: String
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
        state: {
            type: [String],
            trim: true,
            enum: ['employee', 'employer'],
            default: []
        },
        birthday: {
            type: Date,
            required: [true, "birthday field is required to create a particular account "]
        },
        validationToken: {
            token: String,
            date: Date
        },
        tags: {
            type: [String],
            trim: true,
            default: [],
            enum: tags
        },
        emailUsed: {
            type: Boolean,
            default: true
        },
        origin: {
            type: String,
            enum: origin_tags
        }
        ,
        initial: {
            type: String
        },
        affiliation: type.affiliation,
        updateAt: {
            type: Date
        },
        lastConnection: {
            type: Date
        },
        creation_is_assisted : {
                type: Boolean,
                default: false
        },
        isNotified: {
            type: Boolean,
            default: true
        }

    }
);

particularSchema.pre('save', function (next) {
    if (this.isNew) {
        if (!this.profilePic.url) {
            if (this.gender === "Man") {
                this.profilePic.url = 'https://res.cloudinary.com/jobaas-files/image/upload/v1596616147/jobaas/man_y16ogs.png';
            } else {
                this.profilePic.url = 'https://res.cloudinary.com/jobaas-files/image/upload/v1596616151/jobaas/female_sr4iq1.png';
            }
        }
    } else {
        if (this.isModified('phoneNumber.value')) {
            this.phoneNumber.valid = false;
        }
        if (this.isModified('profilePic.url') && !this.isModified('profilePic.valid')) {
            this.profilePic.valid = false;
        }
        if (this.isModified('cv.url') && !this.isModified('cv.valid')) {
            this.cv.valid = false;
        }
        if (this.isModified('driver_permit') && !this.isModified('driver_permit.verified')) {
            this.driver_permit.verified = false;
        }
        if (this.isModified('schoolLevel') && !this.isModified('schoolLevel.valid')) {
            this.schoolLevel.valid = false;
        }
    }
    this.street = this.street.toLowerCase();
    this.street = this.street.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    this.town = this.town.toLowerCase();
    this.town = this.town.replace("é", "e");
    this.town = this.town.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    this.street = this.street.replace('&#x27', '');
    this.updateAt = Date.now();
    this.name = this.name.replace("&#X27", "");
    this.surname = this.surname.replace("&#X27", "");
    if (this.profession) {
        this.profession = this.profession.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }
    let tmpName = this.name.split(' ');
    let tmpSurname = this.surname ? this.surname.split(' ') : [];
    let initialName = '';
    let initialSurname = '';
    for (let name of tmpName) {
        initialName = initialName + name[0].toUpperCase();
    }
    for (let surname of tmpSurname) {
        initialSurname = initialSurname + surname[0].toUpperCase();
    }
    this.initial = initialName + initialSurname;
    next();
});

module.exports = particularSchema;