const express = require("express");
const notificationController = require("../controllers/notification");
const router = express.Router();
const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const config = require("../configs/environnement/config");

const ADMIN = config.permissionLevels.ADMIN;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const ENTREPRISE = config.permissionLevels.ENTREPRISE_USER;

router.post("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    EMPLOYER,
    EMPLOYEE,
    CONTROLLER,
    SUP_ADMIN,
  ]),
  notificationController.createNotification,
]);

router.get("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  notificationController.getAllNotifications,
]);

router.delete("/:idNotification", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  notificationController.deleteNotification,
]);

router.get("/:idNotif/read", [notificationController.markAsRead]);

module.exports = router;
