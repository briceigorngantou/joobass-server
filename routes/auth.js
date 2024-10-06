const express = require("express");
const router = express.Router();
const authentificationSecurity = require("../security/authentification");
const authController = require("../controllers/auth");

router.post("/login/:user", [
  // TODO REMOVE COMMENT
  //attackSecurity.attackLimiter('Too Many requests to Sign in. Your account has been blocked and you received an email' +
  //' to change your password.'),
  authentificationSecurity.hasAuthValidFields,
  authentificationSecurity.isPasswordAndUserMatch,
  authController.login,
]);

module.exports = router;
