const blogArticleModel = require('../configs/models/blogArticle');
const mongoose = require("mongoose");
const cleanTextUtils = require('../common/utils/cleanDescription');
const administratorModel = require('../configs/models/administrator');
const particularService = require('../services/particular');
const processing = require('../common/utils/processing');
const formatFilterParams = require('../common/utils/processing').formatFilterParams;

const createBlogArticle = async (blogArticle) => {
    console.log('create blogArticle service was called ');
    const objectId = new mongoose.Types.ObjectId(blogArticle.author);
    blogArticle.author = objectId;
    blogArticle.updateAt = [];
    const newArticle = new blogArticleModel(blogArticle);
    let result = await newArticle.save();
    return {id: result._id};
};

const updateBlogArticle = async (id, blogArticle, idAuthor) => {
    console.log('call update blogArticle service by id : ' + id + 'by the admin :' + idAuthor);
    const currentBlogArticle = await blogArticleModel.findById(id).exec();
    let objectId = new mongoose.Types.ObjectId(idAuthor);
    currentBlogArticle.updateAt.push({modificationDate: Date.now(), idAuthor: objectId});
    currentBlogArticle.author = new mongoose.Types.ObjectId(currentBlogArticle.author);
    currentBlogArticle.set(blogArticle);
    let result = await currentBlogArticle.save();
    result.toJSON();
    delete result._id;
    delete result.__v;
    return result;
};

const getStateBlogArticle = async (id)=>{
    let currentArticle;
    console.log('call get blogArticle by id : ' + id);
    currentArticle = await blogArticleModel.findById(id).select('state').lean().exec();
    return currentArticle.state;
}

const getBlogArticle = async (id, typeId) => {
    let currentArticle;
    console.log('call get blogArticle by id : ' + id + " and type Id : "  + typeId);
    currentArticle = typeId !== 'slug' ? await blogArticleModel
        .findById(id).select('-__v -_id').lean().exec():
        await  blogArticleModel
            .findOne({slug: id}).lean().exec();
    return currentArticle;
};


const enableBlogArticle = async(id, adminId) => {
    console.log('enable blogArticle by id : ' + id);
    const objectId = new mongoose.Types.ObjectId(id);
    try{
        await updateBlogArticle(objectId,{"state": "published"}, adminId);
        return true;
    }catch (e){
        console.log(e.message);
        return false;
    }
};

const addLikeBlogArticle = async(id, userId) => {
    console.log('count new like for this blogArticle by id : ' + id);
    const objectId = new mongoose.Types.ObjectId(id);

    try{
        await blogArticleModel.updateOne({_id: objectId},
            { $inc: { "statistics.nbLikes": 1 }, $push: {"userLikeList": userId}});
        return true;
    }catch (e){
        console.log(e.message);
        return false;
    }
};

const addViewsBlogArticle = async(id, nbViews) => {
    console.log('count new view for this blogArticle by id : ' + id);
    const objectId = new mongoose.Types.ObjectId(id);
    try{
        await blogArticleModel.updateOne({_id: objectId},
            {"statistics.nbViews": nbViews});
        return true;
    }catch (e){
        console.log(e.message);
        return false;
    }
};

const addSharesBlogArticle = async(id, socialNetwork) => {
    console.log('count new share for the blogArticle by objectId : ' + id);
    const objectId = new mongoose.Types.ObjectId(id);
    try{
        switch (socialNetwork){
            case "facebook":
                await blogArticleModel.updateOne({_id: objectId},
                { $inc: { "statistics.shares.facebook": 1 }});
                break;
            case "twitter":
                await blogArticleModel.updateOne({_id: objectId},
                    { $inc: { "statistics.shares.twitter": 1 }});
                break;
            case "linkedIn":
                await blogArticleModel.updateOne({_id: objectId},
                    { $inc: { "statistics.shares.linkedIn": 1 }});
                break;
            case "whatsApp":
                await blogArticleModel.updateOne({_id: objectId},
                    { $inc: { "statistics.shares.whatsApp": 1 }});
                break;
        }
        return true;
    }catch (e){
        console.log(e.message);
        return false;
    }
};

const disableBlogArticle = async(id, adminId) => {
    console.log('disable blogArticle by id : ' + id);
    const objectId = new mongoose.Types.ObjectId(id);
    try{
        await updateBlogArticle(objectId,{"state": "masked"}, adminId);
        return true;
    }catch (e){
        console.log(e.message);
        return false;
    }
}


const getAllBlogArticles = async (perPage, page, filterParams,  level = 1, pagination = true) => {
    let result;
    let requestType;
    console.log('get all blog articles service');
        if (filterParams.requestType && filterParams.requestType.toLocaleLowerCase() === 'full') {
            requestType = filterParams.requestType.toLocaleLowerCase();

    }
    delete filterParams.requestType;
    delete filterParams.limit;
    delete filterParams.page;
    delete filterParams.lang;
    delete filterParams.level;
    // define  level
    const ADMIN_LEVEL = 2
    // list of objectd fields
    let objectIdlist = ["publicationDate", "title", "state"];
    // list of objectd fields

    let length;
    if (filterParams.typeFilter === "raw") {
        filterParams.keyword = cleanTextUtils.strNoAccent(filterParams.keyword);
        filterParams = [{"title": new RegExp(".*" + filterParams.keyword + ".*", "i")}, {"text": new RegExp(".*" + filterParams.keyword + ".*", "i")}];
        length = await blogArticleModel.find().or(filterParams).countDocuments();
            result = await blogArticleModel.find().or(filterParams)
                .and([{"state": "published"}])
                .limit(perPage)
                .skip(perPage * page)
                .select('-__v -text -author  -updateAt')
                .lean()
                .exec();
        //we  handle pagination
    } else {
        filterParams.state = "published";
        length = await blogArticleModel.find(filterParams).countDocuments();
        filterParams = formatFilterParams(filterParams, objectIdlist);
            result = await blogArticleModel.find(filterParams)
                .limit(perPage)
                .skip(perPage * page)
                .select('-__v -text -author -updateAt -state')
                .lean()
                .exec();
    }
    result = {"blogArticles": result, "length": length, "page": page};
    return result;
};

module.exports = {
    createArticle: createBlogArticle,
    updateBlogArticle: updateBlogArticle,
    getBlogArticle: getBlogArticle,
    enableBlogArticle: enableBlogArticle,
    disableBlogArticle: disableBlogArticle,
    addViewsBlogArticle: addViewsBlogArticle,
    addSharesBlogArticle: addSharesBlogArticle,
    addLikeBlogArticle: addLikeBlogArticle,
    getAllBlogArticles: getAllBlogArticles,
    getStateBlogArticle: getStateBlogArticle,
    updateArticle: updateBlogArticle,
    getArticle: getBlogArticle,
    getAllBlogArticles: getAllBlogArticles,
    getStateBlogArticle: getStateBlogArticle
}
