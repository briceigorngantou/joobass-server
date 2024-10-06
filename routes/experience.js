const express = require("express");
const experienceController = require("../controllers/experience");
const router = express.Router();
const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const config = require("../configs/environnement/config");
const ENTREPRISE = config.permissionLevels.ENTREPRISE_USER;
const ADMIN = config.permissionLevels.ADMIN;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;

router.get("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    EMPLOYER,
    ENTREPRISE,
  ]),
  experienceController.getAllExperiences,
]);

router.get("/:idExperience", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    CONTROLLER,
    SUP_ADMIN,
    ENTREPRISE,
  ]),
  experienceController.getExperienceById,
]);

router.put("/:idExperience", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN, ENTREPRISE]),
  experienceController.updateExperience,
]);

router.put("cancel/:idExperience", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  experienceController.cancelExperience,
]);

router.delete("/:idExperience", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN]),
  experienceController.deleteExperience,
]);

router.post("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  experienceController.createExperience,
]);

module.exports = router;
