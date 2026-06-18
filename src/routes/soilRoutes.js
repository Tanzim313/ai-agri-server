const express = require("express");
const {
  analyze,
  history,
  getById,
  remove
} = require("../controllers/soilController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/analyze", protect, analyze);
router.get("/history", protect, history);
router.get("/:id", protect, getById);
router.delete("/:id", protect, remove);

module.exports = router;
