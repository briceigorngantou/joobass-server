const express = require("express");
const applicationController = require("../controllers/application");
const router = express.Router();
const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const businessApplication = require("../business/application");
const particularController = require("../controllers/particular");
const applicationCommonController = require("../common/controllers/application");
const config = require("../configs/environnement/config");

const ADMIN = config.permissionLevels.ADMIN;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const ENTREPRISE = config.permissionLevels.ENTREPRISE_USER;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;

router.get("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  applicationController.getAllApplications,
]);

router.put("/:idApplication/appreciate", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  businessApplication.hasEnoughEmployees,
  applicationCommonController.appreciateApplication,
]);

router.get("/:idApplication", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  applicationController.getApplicationById,
]);

router.get("/:idApplication/candidate", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  applicationController.getCandidateFromApplicationId,
]);

router.put("/:idApplication", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN, CONTROLLER]),
  applicationController.updateApplication,
]);

router.put("cancel/:idApplication", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN, CONTROLLER]),
  applicationController.cancelApplication,
]);

router.put("/:idApplication/markApplicationAsViewed", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    SUP_ADMIN,
    CONTROLLER,
    ENTREPRISE,
    EMPLOYER,
  ]),
  applicationController.markApplicationAsViewed,
]);

router.delete("/:idApplication", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN]),
  applicationController.deleteApplication,
]);

router.post("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  businessApplication.hasEnoughApplications,
  businessApplication.checkIdentity,
  businessApplication.cantApplyTwice,
  businessApplication.anonymizeApplication,
  applicationController.createApplication,
]);

module.exports = router;
