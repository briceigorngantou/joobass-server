const express = require("express");
const evaluationController = require("../controllers/evaluation");
const router = express.Router();
const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const config = require("../configs/environnement/config");
const businessEvaluation = require("../business/evaluation");

const ADMIN = config.permissionLevels.ADMIN;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;

router.get("/", [evaluationController.getAllEvaluations]);

router.get("/:idEvaluation", [evaluationController.getEvaluationById]);

router.put("/:idEvaluation", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN, CONTROLLER]),
  evaluationController.updateEvaluation,
]);

router.delete("/:idEvaluation", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN, CONTROLLER]),
  evaluationController.deleteEvaluation,
]);

router.post("/", [
  //        validationSecurity.validJWTNeeded,
  //        permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN, CONTROLLER]),
  businessEvaluation.cantEvaluateTwice,
  evaluationController.createEvaluation,
]);

router.get("/job/:idJob/user/:idUser", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    SUP_ADMIN,
    CONTROLLER,
    EMPLOYEE,
    EMPLOYER,
  ]),
  evaluationController.getEvaluationByJobByUser,
]);

module.exports = router;
