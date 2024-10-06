const express = require("express");
const companyController = require("../controllers/company");
const mailController = require("../common/controllers/mail");
const smsController = require("../common/controllers/sms");
const applicationController = require("../controllers/application");
const transactionController = require("../controllers/transaction");
const evaluationController = require("../controllers/evaluation");
const fileManagerController = require("../controllers/fileManager");
const notificationController = require("../controllers/notification");
const applicationCommonController = require("../common/controllers/application");
const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const router = express.Router();
const config = require("../configs/environnement/config");
const jobController = require("../controllers/job");
const businessJob = require("../business/job");
const businessTransaction = require("../business/transaction");
const businessEvaluation = require("../business/evaluation");
const businessApplication = require("../business/application");

const ADMIN = config.permissionLevels.ADMIN;
const ENTREPRISE = config.permissionLevels.ENTREPRISE_USER;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;

const busboy = require("connect-busboy");
const busboyBodyParser = require("busboy-body-parser");

router.get("/:id", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ENTREPRISE,
    SUP_ADMIN,
    ADMIN,
    CONTROLLER,
  ]),
  permissionSecurity.onlySameUserOrAdminCanDoThisAction,
  companyController.getCompanyById,
]);

router.get("/profile/me", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ENTREPRISE,
    ADMIN,
    SUP_ADMIN,
    CONTROLLER,
  ]),
  companyController.getCompanyById,
]);

router.post("/", [companyController.createCompany]);

router.put("/:id", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    SUP_ADMIN,
    CONTROLLER,
    ENTREPRISE,
  ]),
  permissionSecurity.onlySameUserOrAdminCanDoThisAction,
  companyController.updateCompany,
]);

router.put("/profile/me", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  companyController.updateCompany,
]);

router.get("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN, CONTROLLER]),
  companyController.getAllCompanies,
]);

router.delete("/:id", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  companyController.deleteCompany,
]);

router.get("/:id/verify_account", [
  mailController.confirmCreate("companyService"),
]);

router.post(
  "/resetForgottenPassword/mail",
  mailController.sendMailForgottenPassword("companyService")
);

router.post(
  "/resetForgottenPassword/mail2",
  mailController.sendMailForgottenPasswordRandomCode("particularService")
);

router.put(
  "/changePassword",
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  mailController.replaceForgottenPassword("companyService")
);

router.put(
  "/changePassword2",
  mailController.replaceForgottenPasswordRandomCode("companyService")
);

router.post(
  "/RandomCodeRequest/changeMail",
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    ENTREPRISE,
  ]),
  smsController.queryChangeMailAdress("companyService")
);

router.put(
  "/RandomCodeRequest/changeMail",
  smsController.replaceEmailAdress("companyService")
);

router.post("/me/send_sms_verification", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  smsController.queryVerificationParticularNumber("companyService"),
]);

router.get("/me/verify_sms_code", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  smsController.checkVerificationParticularNumber("companyService"),
]);

//Jobs

router.post("/me/job", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  businessJob.isStartDateAfterCurrentDate,
  jobController.createJob,
]);

router.get("/me/job", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  jobController.getAllJobs,
]);

router.put("/me/job/:idJob", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  businessJob.isJobCreator,
  jobController.updateJob,
]);

//application

router.put("/me/application/:idApplication/appreciate", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  businessApplication.hasEnoughEmployees,
  applicationCommonController.appreciateApplication,
]);

router.get("/me/job/:idJob/application", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  businessJob.isJobCreator,
  applicationController.getAllApplicationsFromJob,
]);

router.get("/me/application/:idApplication/candidate", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  applicationController.getCandidateFromApplicationId,
]);

router.get("/me/application/:idApplication/employer", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  applicationController.getApplicationById,
]);

router.put("/me/job/:idJob/cancel", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  businessJob.isJobCreator,
  jobController.cancelJob,
]);

router.delete("/me/job/:idJob", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  businessJob.isJobCreator,
  jobController.deleteJob,
]);

// Transactions

router.post("/me/transaction", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  businessTransaction.isContractClosedOrFailed,
  //transactionController.charge,
  transactionController.createTransaction,
]);

router.get("/me/transaction", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  transactionController.getAllTransactions,
]);

router.get("/me/transaction/:idTransaction", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  transactionController.getTransactionById,
]);

//files

router.post("/me/fileManager/file", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  fileManagerController.createFile,
]);

router.put("/me/fileManager/file/:idFile", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  fileManagerController.updateFile,
]);

router.post("/me/fileS3", [
  busboy(),
  busboyBodyParser(),
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  fileManagerController.createFileAws,
]);

router.get("/me/metadatafiles", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  fileManagerController.getAllMetaFiles,
]);

router.put("/me/fileS3/:bucketKey", [
  busboy(),
  busboyBodyParser(),
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  fileManagerController.updateFileAws,
]);

router.get("/me/:bucketKey/streamAws", [fileManagerController.getFileAws]);

router.delete("/owner/fileAws/:bucketKey", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN]),
  fileManagerController.deleteFileAws,
]);

//Notification
router.get("/me/notification", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, ENTREPRISE]),
  notificationController.getAllNotifications,
]);

//markAsReadForUser
router.put("/me/notification/mark_read_user", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  notificationController.markUserRead,
]);

// Evaluation
router.post("/me/evaluation", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  businessEvaluation.cantEvaluateTwice,
  evaluationController.createEvaluation,
]);

router.get("/me/evaluation", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  evaluationController.getAllEvaluations,
]);

router.get("/:idEvaluation", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ENTREPRISE]),
  evaluationController.getEvaluationById,
]);

router.get("/:userId/evaluations", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  evaluationController.getUserEvaluations,
]);

module.exports = router;
