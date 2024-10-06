const express = require('express');

const particularController = require('../controllers/particular');
const applicationController = require('../controllers/application');
const experienceController = require('../controllers/experience');
const litigationController = require('../controllers/litigation');
const transactionController = require('../controllers/transaction');
const evaluationController = require('../controllers/evaluation');
const fileManagerController = require('../controllers/fileManager');
const notificationController = require('../controllers/notification');
const administratorController = require('../controllers/administrator');
const mailController = require('../common/controllers/mail');
const smsController = require('../common/controllers/sms');
const businessCommonRules = require('../business/common');
const applicationCommonController = require('../common/controllers/application');
const employerController = require('../common/controllers/employer');

const jobController = require('../controllers/job');
const validationSecurity = require('../security/validation');
const permissionSecurity = require('../security/permission');
const sanitizeSecurity = require('../security/sanitize');

const router = express.Router();
const config = require('../configs/environnement/config');
server = require('../server');

const businessApplication = require('../business/application');
const businessJob   = require('../business/job');
const businessParticular = require('../business/particular');
const businessLitigation = require('../business/litigation');
const businessTransaction = require('../business/transaction');
const businessEvaluation = require('../business/evaluation');

const ADMIN = config.permissionLevels.ADMIN;
const EMPLOYER = config.permissionLevels.EMPLOYER_USER;
const EMPLOYEE = config.permissionLevels.EMPLOYEE_USER;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;
const ENTREPRISE = config.permissionLevels.ENTREPRISE_USER;

const busboy = require('connect-busboy');
const busboyBodyParser = require('busboy-body-parser');

router.get('/:id',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
        particularController.getParticularById,
    ]);

router.get('/profile/me',
    [
        validationSecurity.validJWTNeeded,
        particularController.getParticularById
    ]);

router.post('/:codeAmbassador',
    [
        sanitizeSecurity.validate('createUser'),
        businessParticular.checkAge,
        particularController.createParticular
    ]);

    router.post('/',
    [
        sanitizeSecurity.validate('createUser'),
        businessParticular.checkAge,
        particularController.createParticular
    ]);

  

router.post('/option/withoutPassword',
    [businessParticular.isPasswordGenerated,
        sanitizeSecurity.validate('createUser'),
        businessParticular.checkAge,
        particularController.createParticularWithoutPassword
    ]);



router.post('/resetForgottenPassword/mail',
    mailController.sendMailForgottenPassword('particularService')
);

router.post('/resetForgottenPassword/mail2',
    mailController.sendMailForgottenPasswordRandomCode('particularService')
);

router.put('/changePassword',
    validationSecurity.validJWTNeeded,
    permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
    mailController.replaceForgottenPassword('particularService')
);

router.put('/changePassword2',
    mailController.replaceForgottenPasswordRandomCode('particularService')
);

router.post('/RandomCodeRequest/queryChangeMail',
    validationSecurity.validJWTNeeded,
    permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN, EMPLOYER, EMPLOYEE]),
    smsController.queryChangeMailAdress('particularService')
);

router.put('/RandomCodeRequest/changeMail',
    smsController.replaceEmailAdress('particularService')
);


router.put('/:id',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
        particularController.updateParticular
    ]);

router.put('/profile/me',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER, EMPLOYEE, ADMIN, CONTROLLER, SUP_ADMIN]),
        particularController.updateParticular
    ]);

router.put('/notify/me',
    validationSecurity.validJWTNeeded,
    permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
    employerController.updateNotify
);



router.get('/',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
        particularController.getAllParticulars
    ]);

router.delete('/:id',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
        particularController.deleteParticular
    ]);

router.get('/:id/verify_account',
    [
        mailController.confirmCreate('particularService')
    ]);


// Experience

router.post('/me/experience',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE]),
        experienceController.createExperience
    ]);

router.get('/me/experience',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE]),
        experienceController.getAllExperiences
    ]);

router.get('/me/experience/:idExperience',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE]),
        experienceController.getExperienceById
    ]);

router.put('/me/experience/:idExperience',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE]),
        experienceController.updateExperience
    ]);
router.put('/me/experience/:idExperience/cancel',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE]),
        experienceController.cancelExperience
    ]);

// Application

router.post('/me/application',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE]),
        //businessApplication.checkSchoolLevel,
        //businessApplication.checkIdentity,
        //businessApplication.checkCv,
        businessApplication.hasEnoughApplications,
        businessApplication.cantApplyTwice,
        //businessApplication.anonymizeApplication,
        applicationController.createApplication
    ]);



router.get('/me/application',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE]),
        applicationController.getAllFullApplications
    ]);

router.get('/me/application/nbApplications',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE]),
        applicationController.getNbApplicationByEmployee
    ]);

router.get('/me/application/:idApplication',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE]),
        businessApplication.isOwner,
        applicationController.getApplicationById
    ]);

router.get('/me/application/:idApplication/employer',
[
    validationSecurity.validJWTNeeded,
    permissionSecurity.permissionLevelRequired([EMPLOYER]),
    applicationController.getApplicationById
]);


router.get('/me/application/:idApplication/candidate',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER]),
        applicationController.getCandidateFromApplicationId,
    ]);

router.put('/me/application/:idApplication',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        businessApplication.isOwner,
        businessApplication.anonymizeApplication,
        applicationController.updateApplication
    ]);
router.put('/me/application/:idApplication/cancel',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        businessApplication.isOwner,
        applicationController.cancelApplication
    ]);

router.put('/me/application/:idApplication/appreciate',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER]),
        businessApplication.hasEnoughEmployees,
        applicationCommonController.appreciateApplication
    ]);

router.delete('/me/application/:idApplication',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER, ADMIN, SUP_ADMIN]),
        businessApplication.isOwner,
        applicationController.deleteApplication
    ]);

    router.post('/me/application/withoutLoging',
    [
        busboy(),
        busboyBodyParser(),
        fileManagerController.createMultipleFileAws,
        applicationController.createApplicationWithoutAccount
    ]);    

    router.post('/me/application/withFile',
    [   validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        busboy(),
        busboyBodyParser(),
        fileManagerController.createMultipleFileAws,
        applicationController.createApplication
    ]);        


// Job
router.get('/me/job',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER]),
        jobController.getAllJobs
    ]);

router.post('/me/job',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER]),
        businessCommonRules.checkTitleSize,
        businessJob.isStartDateAfterCurrentDate,
        businessJob.isLastDateVisibilityBeforeEndDate,
        jobController.createJob
    ]);


router.put('/me/job/:idJob',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER]),
        businessJob.isJobCreator,
        jobController.updateJob
    ]);

    router.put('/me/job/:idJob/cancel',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER]),
        businessJob.isJobCreator,
        jobController.cancelJob
    ]);


router.get('/me/job/:idJob',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        businessJob.isJobCreator,
        jobController.getJobById
    ]);

    router.put('/me/job/:idJob/jobDone',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER]),
        businessJob.isJobCreator,
        jobController.jobDone
    ]);

    router.get('/me/job/:idJob/application',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        businessJob.isJobCreator,
        applicationController.getAllApplicationsFromJob
    ]);

    router.delete('/me/job/:idJob',
        [
            validationSecurity.validJWTNeeded,
            permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
            businessJob.isJobCreator,
            jobController.deleteJob
        ]);

// Evaluation
router.post('/me/evaluation',
    [
 //       validationSecurity.validJWTNeeded,
//        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        businessEvaluation.cantEvaluateTwice,
        evaluationController.createEvaluation
    ]);

router.get('/me/evaluation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        evaluationController.getAllEvaluations
    ]);

router.get('/:idEvaluation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        evaluationController.getAllEvaluations
    ]);

router.get('/me/evaluation/:idEvaluation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        evaluationController.getEvaluationById
    ]);

router.put('/me/evaluation/:idEvaluation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        evaluationController.updateEvaluation
    ]);


router.delete('/me/evaluation/:idEvaluation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        evaluationController.deleteEvaluation
    ]);

router.get('/me/bestJober',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        particularController.getBestJober
    ]);

router.get('/me/bestJobers',
    [
        particularController.getBestJobers
    ]);

// Litigation
router.post('/me/litigation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        businessLitigation.canComplain,
        litigationController.createLitigation

    ]);

    router.get('/me/litigation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        litigationController.getAllLitigations

    ]);

    router.get('/me/litigation/:idLitigation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        // businessLitigation.canComplain,
        litigationController.getLitigationById

    ]);

    router.put('/me/litigation/:idLitigation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        //businessLitigation.canComplain,
        litigationController.updateLitigation
    ]);

router.delete('/me/litigation/:idLitigation',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        //businessLitigation.canComplain,
        litigationController.deleteLitigation
    ]);

//Metafiles

router.post('/me/fileManager/file',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        fileManagerController.createFile
    ]);

router.put('/me/fileManager/file/:idFile',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        fileManagerController.updateFile
    ]);

router.put('/me/fileAws/:idFile',

    [   busboy(),
        busboyBodyParser(),
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        fileManagerController.updateFileAws
    ]);


router.post('/me/fileS3',
    [
        busboy(),
        busboyBodyParser(),
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        fileManagerController.createFileAws
    ]
) 

 // Transactions

router.post('/me/transaction',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER]),
        businessTransaction.isPaymentTypeRight,
        businessTransaction.isAmountRight,
        businessTransaction.isContractClosedOrFailed,
        //transactionController.charge,
        transactionController.createTransaction,
    ]);

router.put('/me/change-role',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER, EMPLOYEE]),
        administratorController.changeRole
    ]);

router.get('/me/transaction',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        transactionController.getAllTransactions
    ]);


router.get('/me/transaction/:idTransaction',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        transactionController.getTransactionById
    ]);


//files
router.get('/me/metadatafiles',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        fileManagerController.getAllMetaFiles
    ]);

router.get('/me/metadata/:idMeta',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER, EMPLOYEE]),
        permissionSecurity.onlySameUserOrAdminCanDoThisAction,
        fileManagerController.getMetafileById
    ]);

router.get('/me/:idFile/stream',
    [
        fileManagerController.getFileStreamed
    ]
);

router.get('/me/:bucketKey/streamAws',
    [
        fileManagerController.getFileAws
    ]
);

router.post('/me/file',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        fileManagerController.createFile
    ]);



router.put('/me/file/:idFile',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYER, EMPLOYER]),
        fileManagerController.updateFile      
    ]);


router.delete('/owner/file/:idFile',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN]),
        fileManagerController.deleteFile
    ]);

router.post('/me/fileS3',
    [
        busboy(),
        busboyBodyParser(),
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        fileManagerController.createFileAws
    ]
);
    
router.put('/me/fileS3/:bucketKey',
    [
        busboy(),
        busboyBodyParser(),
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        fileManagerController.updateFileAws,
        fileManagerController.createFileAws  
    ]); 

router.delete('/owner/fileAws/:bucketKey',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([ADMIN]),
        fileManagerController.deleteFileAws
    ]);


 //sms
router.post('/me/send_sms_verification',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        smsController.queryVerificationParticularNumber('particularService')
    ]);

router.get('/me/verify_sms_code',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        smsController.checkVerificationParticularNumber('particularService')
    ]);

router.put('/me/phoneNumber/verification',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        particularController.verifyPhoneNumber
    ]);

router.get('/:userId/verify_phonenumber',
    [
        smsController.checkVerificationParticularNumber('particular')
    ]);

//Notification
router.get('/me/notification',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        notificationController.getAllNotifications
    ]);

//markAsReadForUser
router.put('/me/notification/mark_read_user',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([EMPLOYEE, EMPLOYER]),
        notificationController.markUserRead
    ]);


router.get('/:userId/evaluations',
    [
        validationSecurity.validJWTNeeded,
        permissionSecurity.permissionLevelRequired([SUP_ADMIN, ADMIN, CONTROLLER, EMPLOYER, EMPLOYEE, ENTREPRISE]),
        evaluationController.getUserEvaluations
    ]);

module.exports = router;
