const express = require("express");
const fileManagerController = require("../controllers/fileManager");
const router = express.Router();

const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");

const config = require("../configs/environnement/config");
const ADMIN = config.permissionLevels.ADMIN;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const ENTREPRISE = config.permissionLevels.ENTREPRISE_USER;

const busboy = require("connect-busboy");
const busboyBodyParser = require("busboy-body-parser");
const businessFileManager = require("../business/fileManager");

router.get("/metadata", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  fileManagerController.getAllMetaFiles,
]);

router.get("/fileS3", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  fileManagerController.getAllFilesAws,
]);

router.get("/owner/:id/metadata/:idMeta", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([
    ADMIN,
    EMPLOYER,
    EMPLOYEE,
    ENTREPRISE,
    CONTROLLER,
    ADMIN,
    SUP_ADMIN,
  ]),
  permissionSecurity.onlySameUserOrAdminCanDoThisAction,
  fileManagerController.getMetafileById,
]);

router.get("/:idFile/stream", [fileManagerController.getFileStreamed]);

router.get("/:bucketKey/streamAws", [fileManagerController.getFileAws]);

router.post("/owner/:id/file", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  businessFileManager.checkBusinessRights,
  fileManagerController.createFile,
]);
/*
router.post('/owner/:id/file/withoutloging',
    [
        fileManagerController.createFile,
    ]);
*/
router.post("/owner/:id/file/withoutloging", [
  busboy(),
  busboyBodyParser(),
  validationSecurity.validJWTNeeded,
  businessFileManager.checkBusinessRights,
  fileManagerController.createFileAws,
]);

router.post("/owner/:id/fileAws", [
  busboy(),
  busboyBodyParser(),
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  businessFileManager.checkBusinessRights,
  fileManagerController.createFileAws,
]);

router.put("/owner/:id/file/:idFile", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  businessFileManager.checkBusinessRights,
  fileManagerController.updateFile,
]);

router.put("/owner/:id/fileAws/:idFile", [
  busboy(),
  busboyBodyParser(),
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  businessFileManager.checkBusinessRights,
  fileManagerController.updateFileAws,
]);

router.delete("/owner/:id/file/:idFile", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  fileManagerController.deleteFile,
]);

router.put("/metafile/:metaId/migration", [
  busboy(),
  busboyBodyParser(),
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN]),
  fileManagerController.migrationS3,
]);

module.exports = router;
