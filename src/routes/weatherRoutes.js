const express = require("express");
const {
  current,
  forecast,
  history
} = require("../controllers/weatherController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/current", protect, current);
router.get("/forecast", protect, forecast);
router.get("/history", protect, history);

module.exports = router;
