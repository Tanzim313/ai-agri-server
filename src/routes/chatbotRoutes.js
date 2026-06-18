const express = require("express");
const { chat, history } = require("../controllers/chatbotController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, chat);
router.get("/history", protect, history);

module.exports = router;
