const express = require('express');
const config = require('../configs/environnement/config');
const openingController = require('../controllers/opening');
const ADMIN = config.permissionLevels.ADMIN;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const validationSecurity = require('../security/validation');
const permissionSecurity = require('../security/permission');
const router = express.Router();

router.get('/:idOpening',
    [
        openingController.getOpening
    ]);



router.post('/',
    [ 
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
        openingController.createOpening
    ]);
    
    

/*    
router.delete('/:id',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
        particularController.deleteParticular
    ]);
*/


module.exports = router;
