const config = require('../configs/environnement/config');
const ENTREPRISE_USER = config.permissionLevels.ENTREPRISE_USER;
const error_processing = require("../common/utils/error_processing");
const {communicationRights, ADMIN_RIGHTS} = require("../common/utils/enum");

const checkBusinessRights = async (req, res, next) => {
    const lang = req.query.lang ? req.query.lang : "en";
    let message;
    const typeOwner =  req.query.typeOwner  ?  req.query.typeOwner  :
        req.jwt.permissionLevel.includes(ENTREPRISE_USER) ? "entreprise"
            : req.jwt.permissionLevel.includes(ADMIN_RIGHTS) ? "administrator"
                :  "particular";
    try {
        if(req.query.fileType !== "logoBlogArticle"){
            if (typeOwner === "administrator" && req.jwt.permissionLevel.includes(communicationRights)) {
                if(req.params.idBlogArticle){
                    next();
                }else{
                    message = lang === "fr" ?
                        "l'id de l'article est requis pour ajouter le logo associé":
                        "The id of blog Article is required to create an image Header";
                    return res.status(400).json({
                        'message': message
                    });
                }
            } else {
                message = lang  === "fr" ?
                    "Seul les collaborateurs de l'équipe communication sont autorisées à effectuer cette action":
                    "The id of blog Article is required to create an image Header";
                return res.status(403).json({
                    'message': message
                });
            }
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
    checkBusinessRights: checkBusinessRights
}