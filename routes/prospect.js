const express = require("express");

const prospectController = require("../controllers/prospect");
const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const sanitizeSecurity = require("../security/sanitize");

const router = express.Router();
const config = require("../configs/environnement/config");

const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const ADMIN = config.permissionLevels.ADMIN;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;

router.post("/", [
  sanitizeSecurity.validate("createProspect"),
  prospectController.createProspect,
]);

router.get("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  prospectController.getAllProspects,
]);

module.exports = router;
