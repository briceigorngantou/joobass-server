const express = require("express");

const smsController = require("../controllers/sms");
const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");

const router = express.Router();
const config = require("../configs/environnement/config");

const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const ADMIN = config.permissionLevels.ADMIN;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;

router.post("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  smsController.sendSms,
]);

module.exports = router;
