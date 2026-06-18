const express = require("express");
const { recommend } = require("../controllers/irrigationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/recommend", protect, recommend);

module.exports = router;
