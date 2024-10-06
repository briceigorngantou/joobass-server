const express = require("express");
const mailController = require("../common/controllers/mail");
const administratorController = require("../controllers/administrator");
const fileManagerController = require("../controllers/fileManager");
const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const router = express.Router();
const config = require("../configs/environnement/config");
const ADMIN = config.permissionLevels.ADMIN;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const RH = config.permissionLevels.RH_USER;
const COMMERCIAL = config.permissionLevels.COMMERCIAL_USER;
const jobController = require("../controllers/job");
const notificationController = require("../controllers/notification");
const limitIPMiddleware = require("../security/rate_attack");
const businessApplication = require("../business/application");
const businessParticular = require("../business/particular");
const businessJob = require("../business/job");
const transactionController = require("../controllers/transaction");
const smsController = require("../common/controllers/sms");

router.get("/:id", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN, RH]),
  administratorController.getAdministratorById,
]);

router.get("/profile/me", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    RH,
    COMMERCIAL,
  ]),
  administratorController.getAdministratorById,
]);

router.get("/search/particular", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    RH,
  ]),
  administratorController.getParticularByName,
]);

router.put("/metafile/:idMeta", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    RH,
    COMMERCIAL,
  ]),
  administratorController.changeMetaFile,
]);

router.put("/particular/:userId/role", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    RH,
    COMMERCIAL,
  ]),
  administratorController.changeRole,
]);

router.post("/", [
  //limitIPMiddleware.limitIp,
  //validationSecurity.validJWTNeeded,
  //permissionSecurity.permissionLevelRequired([SUP_ADMIN]),
  administratorController.createAdministrator,
]);

router.get("/me/job", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    SUP_ADMIN,
    CONTROLLER,
    COMMERCIAL,
  ]),
  jobController.getAllJobs,
]);

router.post("/createRH", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN]),
  administratorController.createAdministrator,
]);

router.post("/createController", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN, RH]),
  administratorController.createAdministrator,
]);

router.post("/createCommercial", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN, RH]),
  administratorController.createAdministrator,
]);

router.post("/createCommunicationMember", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN, RH]),
  administratorController.createAdministrator,
]);

router.post(
  "/resetForgottenPassword/mail",
  mailController.sendMailForgottenPassword("administratorService")
);

router.post(
  "/resetForgottenPassword/mail2",
  mailController.sendMailForgottenPasswordRandomCode("administratorService")
);

router.put(
  "/changePassword/:token",
  validationSecurity.validJWTNeeded,
  mailController.replaceForgottenPassword("administratorService")
);

router.put(
  "/changePassword2",
  mailController.replaceForgottenPasswordRandomCode("administratorService")
);

router.post(
  "/RandomCodeRequest/changeMail",
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  smsController.queryChangeMailAdress("administratorService")
);

router.put(
  "/RandomCodeRequest/changeMail",
  smsController.replaceEmailAdress("administratorService")
);

router.put("/:id", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN, RH]),
  administratorController.updateAdministrator,
]);

router.put("/profile/me", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    SUP_ADMIN,
    ADMIN,
    CONTROLLER,
    RH,
    COMMERCIAL,
  ]),
  administratorController.updateAdministrator,
]);

router.get("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN, RH]),
  administratorController.getAllAdministrators,
]);

router.delete("/:id", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN]),
  administratorController.deleteAdministrator,
]);

router.get("/:id/verify_account", [
  mailController.confirmCreate("administratorService"),
]);

router.put("/particular/:idParticular/activate", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMERCIAL,
  ]),
  administratorController.activateAccount,
]);

router.put("/company/:idCompany/activate", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMERCIAL,
  ]),
  administratorController.activateAccount,
]);

router.put("/job/:idJob/validate", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMERCIAL,
    RH,
  ]),
  administratorController.validateJob,
]);

router.put("/job/:idJob/reject", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMERCIAL,
    RH,
  ]),
  administratorController.rejectJob,
]);

router.put("/job/:idJob/activate", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMERCIAL,
  ]),
  administratorController.activateJob,
]);

router.put("/job/:idJob/price/disable", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    COMMERCIAL,
  ]),
  administratorController.disablePrice,
]);

router.put("/job/:idJob/choose/:idJober", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    RH,
    COMMERCIAL,
  ]),
  businessApplication.hasEnoughApplications,
  administratorController.affectJoberToJob,
]);

router.put("/job/:idJob/jobDone", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  jobController.jobDone,
]);

router.put("/job/:idJob/invalidate", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  //TODO HAS ALREADY BEEN INVALIDATED LAYER
  administratorController.invalidateJob,
]);

//Metafiles

router.post("/me/fileManager/file", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    SUP_ADMIN,
    CONTROLLER,
    RH,
    COMMERCIAL,
  ]),
  fileManagerController.createFile,
]);

router.put("/me/fileManager/file/:idFile", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    SUP_ADMIN,
    CONTROLLER,
    RH,
    COMMERCIAL,
  ]),
  fileManagerController.updateFile,
]);

// Transactions

router.delete("/owner/file/:idFile", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  fileManagerController.deleteFile,
]);

router.put("/metafile/:idMeta/validate", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    SUP_ADMIN,
    ADMIN,
    CONTROLLER,
    RH,
  ]),
  fileManagerController.validateFile,
]);
router.put("/metafile/:idMeta/reject", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    SUP_ADMIN,
    ADMIN,
    CONTROLLER,
    RH,
  ]),
  fileManagerController.rejectFile,
]);

router.get("/me/notification", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    SUP_ADMIN,
    ADMIN,
    CONTROLLER,
    COMMERCIAL,
    RH,
  ]),
  notificationController.getAllNotifications,
]);

router.put("/generatePassword/:userId", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN, CONTROLLER]),
  businessParticular.isPasswordGenerated,
  administratorController.generatePasswordForUser,
]);

//S3 bucket

router.post("/createBucket", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN, CONTROLLER]),
  fileManagerController.createBucket,
]);

router.post("/deleteBucket", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN, CONTROLLER]),
  fileManagerController.deleteBucket,
]);

module.exports = router;
