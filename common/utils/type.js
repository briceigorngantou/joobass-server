const reasons = require('../../common/utils/enum').reasons_random_code;

const geo_coordinates =    {
    longitude: {
        type: Number,
        required: false
    },
    latitude: {
        type: Number,
        required: false
    }
};

const  affiliation = {
    code: {
        type: String
    },
    from: {
        type: String
    },
    count: {
        type: Number,
        required: false,
        default: 0
    }
};


const random_code_for_processes = {
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
};

const commentBlogArticle = {
    type: [
        {
            idThread: {
                type:String
            },
            Nom: {
                type: String,
                required: true
            },
            dateComment: {
                type: Date,
                default: Date.now()
            },
            comment: {
                type: String,
                required: true
            },
            startThread: {
                type: Boolean,
                default: true
            },
            positionInThread : {
                type: Number,
                default: 0
            },

        }
    ]
};

module.exports = {
    geo_coordinates: geo_coordinates,
    affiliation: affiliation, 
    random_code_for_processes:random_code_for_processes,
    commentBlogArticle: commentBlogArticle
};