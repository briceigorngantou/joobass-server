const express = require("express");
const tagController = require("../controllers/tag");
const router = express.Router();

router.get("/", [tagController.getAllTags]);

module.exports = router;
