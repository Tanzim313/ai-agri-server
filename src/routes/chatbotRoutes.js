const express = require("express");
const { chat, history } = require("../controllers/chatbotController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Dev-friendly ping to verify route presence (no auth)
router.get('/ping', (req, res) => {
	return res.json({ success: true, message: 'chatbot route is reachable' });
});

router.post("/", protect, chat);
router.get("/history", protect, history);

module.exports = router;
