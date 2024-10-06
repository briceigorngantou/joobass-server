const express = require("express");
const transactionController = require("../controllers/transaction");
const router = express.Router();
const validationSecurity = require("../security/validation");
const permissionSecurity = require("../security/permission");
const config = require("../configs/environnement/config");

const businessTransaction = require("../business/transaction");

const ADMIN = config.permissionLevels.ADMIN;
const CONTROLLER = config.permissionLevels.CONTROLLER_USER;
const SUP_ADMIN = config.permissionLevels.SUP_ADMIN;

router.get("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  transactionController.getAllTransactions,
]);

router.get("/:idTransaction", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  transactionController.getTransactionById,
]);

router.put("/:idTransaction", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  transactionController.updateTransaction,
]);

router.delete("/:idTransaction", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, SUP_ADMIN]),
  transactionController.deleteTransaction,
]);

router.post("/", [
  validationSecurity.validJWTNeeded,
  permissionSecurity.permissionLevelRequired([ADMIN, CONTROLLER, SUP_ADMIN]),
  businessTransaction.isPaymentTypeRight,
  businessTransaction.isAmountRight,
  businessTransaction.isContractClosedOrFailed,
  // transactionController.charge,
  transactionController.createTransaction,
]);

module.exports = router;
