const error_processing = require("../common/utils/error_processing");
const blogArticleService = require("../services/blogArticle");

hasAlreadyLiked = async (req,res, next) => {
    try {
        let lang = req.query.lang ? req.query.lang : "en";
        const message = lang === "fr" ?
            "you have already Like this blog Article" :
            "vous avez déjà liké cet Article";
        let idBlogArticle = req.params.idBlogArticle;
        let typeId = req.query.typeId  ? req.query.typeId : "id";
        const blogArticle = await blogArticleService.getBlogArticle(idBlogArticle, typeId);
        const intercept = blogArticle.userLikeList.includes(req.jwt.userId) ;
        if(intercept  === true){
            return res.status(400).json({
                'message': message,
                'data': false
            });
        }else{
            next();
        }
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.BusinessError(" ", 500, "undefined", req.query.lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};

module.exports = {
    hasAlreadyLiked: hasAlreadyLiked
}