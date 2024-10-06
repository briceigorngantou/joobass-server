const express = require("express");
const jobController = require("../controllers/job");
const router = express.Router();

const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const businessApplication = require("../business/application");
const businessCommonRules = require("../business/common");
const businessJob = require("../business/job");

const config = require("../configs/environnement/config");
const ADMIN = config.permissionLevels.ADMIN;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const ENTREPRISE = config.permissionLevels.ENTREPRISE_USER;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;

router.get("/streets", [jobController.getAllJobLocation]);

router.get("/", [jobController.getAllJobs]);

router.get("/:idJob", [
  validationSecurity.validJWTOptional,
  jobController.getJobById,
]);

router.put("/:idJob/jobDone", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  businessApplication.checkIdentity,
  jobController.jobDone,
]);

router.put("/:idJob", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  businessApplication.checkIdentity,
  jobController.updateJob,
]);

router.put("cancel/:idJob", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  businessApplication.checkIdentity,
  jobController.cancelJob,
]);

router.delete("/:idJob", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  businessApplication.checkIdentity,
  jobController.deleteJob,
]);

router.post("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  businessCommonRules.checkTitleSize,
  businessJob.isStartDateAfterCurrentDate,
  businessJob.isLastDateVisibilityBeforeEndDate,
  businessApplication.checkIdentity,
  jobController.createJob,
]);

router.post("/scrappedJobs", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  jobController.createJob,
]);

router.post("/employerPayment/estimation", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    EMPLOYER,
    ENTREPRISE,
  ]),
  jobController.getEstimationEmployerPayment,
]);

router.get("/:idJob/employees", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    EMPLOYER,
    ENTREPRISE,
  ]),
  businessJob.isJobCreator,
  jobController.getHiredEmployees,
]);

router.get("/title_job/:slug", [
  validationSecurity.validJWTOptional,
  //        permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  jobController.getJobBySlug,
]);

router.get("/:idJob/nbApplications", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    EMPLOYER,
    ENTREPRISE,
  ]),
  jobController.getNbApplicationsByJob,
]);

router.get("/user/:idUser/applications/validated", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    EMPLOYEE,
  ]),
  jobController.getValidatedJobsApplicationByEmployee,
]);

router.get("/:idJob/paymentState", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    EMPLOYEE,
    EMPLOYER,
    ENTREPRISE,
  ]),
  jobController.getJobPaymentState,
]);

module.exports = router;
