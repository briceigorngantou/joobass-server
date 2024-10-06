const {Schema} = require("mongoose");
const {packLevelType} = require("../../common/utils/enum");

const packSchema = new Schema(
    {
       title: {
           type: String,
           trim: true,
           index: true,
           required: true
       },
        price: {
           type: Number,
            default: 0,
            required: true
        },
        description:{
           type: String,
            trim: true
        },
        insurance:{
           allowInsurance:{
               type: Boolean,
               default: false
           },
            insurancePrice:{
               type: Number,
                default: 0
            }
        },
        advantages:{
            type: [String],
            default: []
        },
        allowAddOn :{
            type: Boolean,
            default: false
        },
        level:{
            levelType :{
                type: String,
                required: true,
                enum: packLevelType,
                unique: true
            },
            previousLevel:{
                type:  Schema.Types.ObjectId,
                ref: 'pack'
            }
        }
    }
);

module.exports = packSchema;