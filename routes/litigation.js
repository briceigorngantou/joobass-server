const express = require('express');
const litigationController = require('../controllers/litigation');
const router = express.Router();
const validationSecurity = require('../security/validation');
const permissionSecurity = require('../security/permission');
const config = require('../configs/environnement/config');

const ADMIN = config.permissionLevels.ADMIN;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;

router.get('/',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER]),
        litigationController.getAllLitigations,
    ]);

router.get('/:idLitigation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER]),
        litigationController.getLitigationById,
    ]);

router.put('/:idLitigation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN]),
        litigationController.updateLitigation,
    ]);

router.delete('/:idLitigation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN]),
        litigationController.deleteLitigation,
    ]);

router.post('/',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        litigationController.createLitigation,
    ]);

module.exports = router;
