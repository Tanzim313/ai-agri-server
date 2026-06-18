const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { getStats, listUsers, listOrders } = require("../controllers/adminController");

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/stats", getStats);
router.get("/users", listUsers);
router.get("/orders", listOrders);

module.exports = router;
