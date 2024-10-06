const express = require("express");
const blogArticlesController = require("../controllers/blogArticle");
const fileController = require("../controllers/fileManager");
const router = express.Router();
const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const businessFileManager = require("../business/fileManager");
const businessCommonRules = require("../business/common");
const businessBlogArticle = require("../business/blogArticle");
const config = require("../configs/environnement/config");

const ADMIN = config.permissionLevels.ADMIN;
const COMMUNICATION_USER = config.permissionLevels.COMMUNICATION_USER;
const RH_USER = config.permissionLevels.RH_USER;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const ENTREPRISE = config.permissionLevels.ENTREPRISE_USER;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;

router.get("/", [blogArticlesController.getAllBlogArticles]);

router.get("/:idBlogArticle", [blogArticlesController.getBlogArticleById]);

router.post("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMUNICATION_USER,
    RH_USER,
  ]),
  blogArticlesController.createBlogArticle,
]);

router.post("/createImageHeader", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMUNICATION_USER,
    RH_USER,
  ]),
  businessCommonRules.checkTitleSize,
  blogArticlesController.createBlogArticle,
]);

router.post("/:idBlogArticle/ImageHeader", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMUNICATION_USER,
    RH_USER,
  ]),
  businessFileManager.checkBusinessRights,
  fileController.createFile,
]);

router.put("/:idBlogArticle", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMUNICATION_USER,
    RH_USER,
  ]),
  blogArticlesController.updateBlogArticle,
]);

router.put("/:idBlogArticle/enable", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMUNICATION_USER,
    RH_USER,
  ]),
  blogArticlesController.enableBlogArticle,
]);

router.put("/:idBlogArticle/disable", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMUNICATION_USER,
    RH_USER,
  ]),
  blogArticlesController.disableBlogArticle,
]);

router.put("/:idBlogArticle/like", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([EMPLOYER, EMPLOYEE, ENTREPRISE]),
  businessBlogArticle.hasAlreadyLiked,
  blogArticlesController.addLikeBlogArticle,
]);

router.put("/:idBlogArticle/ImageHeader/:idFile", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMUNICATION_USER,
    RH_USER,
  ]),
  businessFileManager.checkBusinessRights,
  fileController.updateFile,
]);

router.put("/updateImageHeader/:idFile", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMUNICATION_USER,
    RH_USER,
  ]),
  fileController.updateFile,
]);

router.put("/updateCommentArticle/:idBlogArticle/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMUNICATION_USER,
    ENTREPRISE,
    EMPLOYER,
    EMPLOYEE,
  ]),
  blogArticlesController.commentArticle,
]);

module.exports = router;
