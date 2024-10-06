const error_processing = require("../common/utils/error_processing");

checkTitleSize = async(req,res, next) => {
    try {
        let title = req.body.title.replace(" ", "");
        let lang = req.query.lang ? req.query.lang : "en";
        const message = lang === "fr" ?
            "the title must be under 50 characters" :
            "le titre doit contenir moins 50 caractères";
        if(title.length > 50){
            return res.status(400).json({
                'message': message
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
    checkTitleSize: checkTitleSize
}