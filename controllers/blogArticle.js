//config
const error_processing = require('../common/utils/error_processing');
const blogArticleService = require('../services/blogArticle');

const _ = require('lodash');
const adminRights = require('../common/utils/enum').adminRights;
const notificationService = require('../services/notification');
const jobService = require('../services/job');
const contractService = require('../services/contract');
const employeeStatService = require('../services/statsEmployee');
const particularService = require('../services/particular');
const companyService = require('../services/company');


const config = require('../configs/environnement/config');
const no_mail = config.no_mail;
const communicationRights = require('../common/utils/enum').communicationRights;
const smsService = require('../services/sms');
const emailService = require('../services/email_sender');


const userRights = require('../common/utils/enum').userRights;
const getStringRefFromTitle = require('../common/utils/processing').getStringRefFromTitle;
const {v4:uuidv4} = require('uuid');


const getAllBlogArticles = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let level = 1;
    try {
        const limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
        let page = 0;
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }

        console.log("call of blog 'article controller: Get All applications ");
        const blogArticles = await blogArticleService.getAllBlogArticles(limit, page, req.query, level);
        console.log('there are blogs articles');
        return res.status(200).json({
            'data': blogArticles
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


const createBlogArticle = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        //delete field with default value
        console.log('Call controller create a blog article ');
        req.body.author = req.jwt.userId;

            console.log("create new article without image");
            req.body.headImageUrl = null;
            req.body.state = "draft";
        req.body.reference = getStringRefFromTitle(req.body.title);

            console.log("création d'un article sans image dans le header");
            req.body.headImageUrl = null;
            const blogArticle = await blogArticleService.createArticle(req.body);
            message = req.query.lang === 'fr' ? 'Un nouvel article a été crée' : 'new blog article was created';
            console.log('new article was created');
            return res.status(200).json({
                'message': message,
                'data': blogArticle
            });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const getBlogArticleById = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        //manage who call the get article for the number of views
        let idBlogArticle = req.params.idBlogArticle;
        let typeId = req.query.typeId  ? req.query.typeId : "id";
        const blogArticle = await blogArticleService.getBlogArticle(idBlogArticle, typeId);
        let message;
        if (!blogArticle) {
            const message = lang === "fr" ? `Cet article n'existe pas pour cet id : ${idBlogArticle}  et ce type: ${typeId}`
                : `No BlogArticle found for this id : ${idBlogArticle} and this type : ${typeId}`;
            return res.status(404).json({
                'message': message
            });
        }
        const nbViews = blogArticle.statistics.nbViews + 1;
        blogArticle.statistics.nbViews = nbViews;
        console.log("Nb Views : " + nbViews);
        idBlogArticle = typeId === "id" ? idBlogArticle : blogArticle._id;
        if (!req.jwt) {
            console.log("Blog Article read by a visitor");
            await blogArticleService.addViewsBlogArticle(idBlogArticle, nbViews);
        } else {
            const intercept = _.intersectionWith(req.jwt.permissionLevel, adminRights);
            if( intercept.length === 0) {
                await blogArticleService.addViewsBlogArticle(idBlogArticle, nbViews);
            }
        }
        message = lang === 'fr' ? "L'article  a été retrouvé" : 'The article has been found';
        console.log('the article was found by id' + ' : ' + idBlogArticle);
        return res.status(200).json({
            'message': message,
            'data': blogArticle
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const enableBlogArticle  = async(req, res)=>{
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        let idBlogArticle = req.params.idBlogArticle;
        const state = await blogArticleService.enableBlogArticle(idBlogArticle, req.jwt.userId);
        if(state){
            message = lang === "fr" ? "Article activé" : "blogArticle enabled";
            return res.status(200).json({
                'message': message,
                'data': state
            });
        }else{
            message = lang === "fr" ? "Article non trouvé ou une erreur est survenue" : "blogArticle not found or an error occurred";
            return res.status(404).json({
                'message': message,
                'data': state
            });
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const addLikeBlogArticle  = async(req, res)=>{
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        let idBlogArticle = req.params.idBlogArticle;
        const state = await blogArticleService.addLikeBlogArticle(idBlogArticle, req.jwt.userId.toString());
        if(state){
            message = lang === "fr" ? "Article aimé" : "blogArticle liked";
            return res.status(200).json({
                'message': message,
                'data': state
            });
        }else{
            message = lang === "fr" ? "Article non trouvé ou une erreur est survenue" : "blogArticle not found or an error occurred";
            return res.status(404).json({
                'message': message,
                'data': state
            });
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const disableBlogArticle  = async(req, res)=>{
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    try {
        let idBlogArticle = req.params.idBlogArticle;
        const state = await blogArticleService.disableBlogArticle(idBlogArticle, req.jwt.userId);
        if(state){
            message = lang === "fr" ? "Article désactivé" : "blogArticle disabled";
            return res.status(200).json({
                'message': message,
                'data': state
            });
        }else{
            message = lang === "fr" ? "Article non trouvé ou une erreur est survenue" : "blogArticle not found or an error occurred";
            return res.status(404).json({
                'message': message,
                'data': state
            });
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const updateBlogArticle = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    let blogArticle;
    try {
        let idBlogArticle = req.params.idBlogArticle;
        blogArticle = await blogArticleService.getBlogArticle(idBlogArticle, "id");
            if (!blogArticle) {
                message = lang === 'fr' ? "Article de blog introuvable" : "the blog's article was not found";
                console.log("the blog's article not found  id : " + idBlogArticle);
                return res.status(404).json({
                    'message': message
                });
            } else {
                blogArticle = await blogArticleService.updateBlogArticle(idBlogArticle, req.body, req.jwt.userId);
                message = req.query.lang === 'fr' ? "L'article de blog a été mise à jour" : "the blog's article was updated";
                console.log("the blog 's article was updated by id : " + idBlogArticle);
                return res.status(200).json({
                    'message': message,
                    'data': blogArticle
                });
            }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

const commentOnArticle = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    let message;
    let blogArticle;
    let user;
    let comment = {}
    try {
            blogArticle = await blogArticleService.getArticle(req.params.idBlogArticle);
            if (!blogArticle) {
                message = req.query.lang === 'fr' ? "Article de blog introuvable" : "the blog's article was not found";
                console.log("the blog's article not found  id : " + req.params.idBlogArticle);
                return res.status(404).json({
                    'message': message
                });
            } else {
                //manage the type of author of the comments
                //manage the isBanned field
                const intercept = _.intersectionWith(req.jwt.permissionLevel, userRights);
                if (intercept.length >0) {
//                    user = particularService.getParticular('_id', req.jwt.userId)
                    comment.author = req.jwt.userId
                    comment.typeAuthor = req.jwt.permissionLevel.includes(config.permissionLevels.ENTREPRISE_USER) ? "entreprise" : "particular"
//                    if (!user) {
//                        user = companyService.getCompany('_id', req.jwt.userId)
//                        comment.typeAuthor = "entreprise"
//                    }
                } else {
                    message = req.query.lang === 'fr' ? "Seuls les utilisateurs avec un compte entreprise, employeur ou chercheur d'emploi peuvent commenter nos articles. Merci de vous connecter ou de créer un compte pour laisser un commentaire" : "Only jobaas users with an enterprise, employer or employee account can post a comment. Please login to your account or subscribe before posting a comment";
                    return res.status(403).json({"message": message})
                }
                if (req.body.startThread) {
                    comment.idComment = String(uuidv4());
                } else {
                    comment.idComment = String(uuidv4());
                    comment.referenceToComment = req.body.referenceToComment;
                }
                comment.dateComment = Date.now()
                comment.comment = req.body.comment;
                blogArticle.threads.push(comment)

                query = {
                    "threads": blogArticle.threads
                }
                blogArticle = await blogArticleService.updateArticle(req.params.idBlogArticle, query, false);
                message = req.query.lang === 'fr' ? "L'article de blog a été mise à jour avec un nouveau commentaire" : "the blog's article was updated with a new comment";
                console.log("the blog 's article was updated by id with a new comment: " + req.params.idBlogArticle);
                return res.status(200).json({
                    'message': message,
                    'data': {"blogArticleId" : req.params.idBlogArticle, "comments": blogArticle.threads}
                });
            }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};



module.exports = {
    createBlogArticle: createBlogArticle,
    updateBlogArticle: updateBlogArticle,
    getBlogArticleById: getBlogArticleById,
    getAllBlogArticles: getAllBlogArticles,
    enableBlogArticle: enableBlogArticle,
    disableBlogArticle: disableBlogArticle,
    addLikeBlogArticle: addLikeBlogArticle,
    commentArticle: commentOnArticle
};