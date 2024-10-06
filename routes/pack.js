const express = require("express");
const config = require("../configs/environnement/config");
const packController = require("../controllers/pack");

const ADMIN = config.permissionLevels.ADMIN;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const ENTREPRISE = config.permissionLevels.ENTREPRISE_USER;

const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const router = express.Router();

router.get("/", [packController.getAllPacks]);

router.get("/advantages/premium", [packController.getPremiumAdvantages]);

router.get("/:idPack", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    SUP_ADMIN,
    EMPLOYER,
    ENTREPRISE,
  ]),
  packController.getPackById,
]);

router.put("/:idPack", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  packController.updatePack,
]);

router.post("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  packController.createPack,
]);

module.exports = router;
