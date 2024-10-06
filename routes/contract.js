const express = require("express");
const contractController = require("../controllers/contract");
const router = express.Router();

const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const businessController = require("../business/contract");
const config = require("../configs/environnement/config");

const ADMIN = config.permissionLevels.ADMIN;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;

router.put("/:idContract/cancel", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  contractController.cancelContract,
]);

router.post("/job/:idJob", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  businessController.hasApplied,
  contractController.createContract,
]);

module.exports = router;
