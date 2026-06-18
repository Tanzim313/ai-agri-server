const express = require("express");
const {
  predict,
  history,
  getById,
  remove
} = require("../controllers/diseaseController");
const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/predict", protect, upload.single("image"), predict);
router.get("/history", protect, history);
router.get("/:id", protect, getById);
router.delete("/:id", protect, remove);

module.exports = router;
