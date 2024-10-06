const mongoose = require('mongoose');
const {createSlug} = require("../../common/utils/processing");
const {strNoAccent} = require("../../common/utils/cleanDescription");
const Schema = mongoose.Schema;
const stateBlogArticle = require('../../common/utils/enum').stateBlogArticle;
const themeBlogArticle = require('../../common/utils/enum').categoryBlogArticle;

const blogArticleSchema = new Schema(
    {
        category: {
            type: String,
            enum: themeBlogArticle,
            default: 'Jobaas',
            required: [true, "To save your work on this article, a state is needed"]
        },
        profileType:{
            type: String,
            enum: ["employer", "employee"],
            default: "employer"
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'administrator',
            trim: true,
            required: [true, "To save your work on this article, the administrator's id who created it is required "],
            index: true,
        },
        title: {
            type: String,
            trim: true,
            required: [true, "To save your work on this article, a title is needed"],
            index: true,
        },
        slug: {
            type: String,
            trim: true,
            index: true,
        },
        text: {
            type: String,
            required: ["To save your work on this article, a String is required in the text field"]
        },
        overview:{
            type: String,
            index: true,
            trim: true
        },
        publicationDate: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: [
                {
                    idAuthor : {
                        type: Schema.Types.ObjectId,
                        ref: 'administrator',
                        required: [true, "To save your work on this article, the administrator's id is required who changed it is required"]
                    },
                    modificationDate: {
                        type: Date,
                        default: Date.now()
                    },
                }
            ],
            default: []
        },
        state: {
            type: String,
            enum: stateBlogArticle,
            default: 'draft',
            required: [true, "To save your work on this article, a state is needed"]
        },
        headImageUrl: {
            type: String,
            trim: true
        },
        userLikeList:{
            type: [String],
            default: [],
            index: true
        },
        statistics : {
            nbViews: {
                type: Number,
                default: 0
            },
            nbLikes:{
                type: Number,
                default: 0
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
            }
        }
    },
);

blogArticleSchema.pre('save', function (next) {
    if (this.isNew) {
        if(this.headImageUrl === null){
            this.headImageUrl = "https://res.cloudinary.com/jobaas-files/image/upload/v1597592654/jobaas/logo_jobass_2020_08_04._vsuisq.png";
        }
    }
    this.title = this.title.replace(",", " ");
    this.title = this.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    this.title = strNoAccent(this.title);
    this.text = strNoAccent(this.text);
    this.title = this.title.replace(/\s\s+/g, ' ');
    this.slug = createSlug(this.title);
    this.overview = this.text.split(' ').slice(0, 20).join(' ') + '...';

    next();
});

module.exports = blogArticleSchema;