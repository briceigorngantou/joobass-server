const list_tag = require('../common/utils/enum').tags;
const list_tag_fr = require('../common/utils/enum').tagsFr;

const getAllTags = (lang) => {
    let tags = lang === 'fr' ? list_tag_fr : list_tag;
    return tags;
};

module.exports = {
    getAllTags: getAllTags,
};
