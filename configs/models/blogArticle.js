const mongoose = require('mongoose');
const blogArticleSchema = require('../schemas/blogArticle');

const blogArticle = mongoose.model('blogarticle', blogArticleSchema);
blogArticle.syncIndexes().then(function () {
    console.log("sync index done for blogArticle ");
});

module.exports = blogArticle;
