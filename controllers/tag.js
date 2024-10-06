const tagService = require('../services/tag');
const error_processing = require("../common/utils/error_processing");

const getAllTags = async (req, res) => {
    let lang = req.query.lang ? req.query.lang : 'en';
    try {
        const tags = await tagService.getAllTags(lang);
        console.log('there are tags');
        return res.status(200).json({
            'data': tags
        });
    } catch (e) {
        console.log(e.message);
        const err = new error_processing.ServerError(e, lang);
        return res.status(500).json({
            'message': error_processing.process(err)
        });
    }
};


module.exports = {
    getAllTags: getAllTags
};
