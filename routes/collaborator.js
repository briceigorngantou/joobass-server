const express = require("express");
const humanResourceController = require("../controllers/collaborator");
const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const router = express.Router();

//configs
const config = require("../configs/environnement/config");
const ADMIN = config.permissionLevels.ADMIN;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const RH = config.permissionLevels.RH_USER;

router.get("/:id", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([RH, SUP_ADMIN, ADMIN]),
  humanResourceController.getHumanResourceById,
]);

router.get("/profile/me", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([RH, ADMIN, SUP_ADMIN]),
  humanResourceController.getHumanResourceById,
]);

router.post("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([RH, ADMIN, SUP_ADMIN]),
  humanResourceController.createHumanResource,
]);

router.put("/:id", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([RH, SUP_ADMIN, ADMIN]),
  humanResourceController.updateHumanResource,
]);

router.get("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN, RH]),
  humanResourceController.getAllHumanResources,
]);

router.delete("/:id", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  humanResourceController.deleteHumanResource,
]);

module.exports = router;
