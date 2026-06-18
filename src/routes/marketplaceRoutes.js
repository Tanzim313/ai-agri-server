const express = require("express");
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  orderHistory,
  getOrderById
} = require("../controllers/marketplaceController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/products", listProducts);
router.get("/products/:id", getProduct);
router.post("/products", protect, authorize("admin"), upload.single("image"), createProduct);
router.put("/products/:id", protect, authorize("admin"), upload.single("image"), updateProduct);
router.delete("/products/:id", protect, authorize("admin"), deleteProduct);
router.post("/orders", protect, createOrder);
router.get("/orders", protect, orderHistory);
router.get("/orders/:id", protect, getOrderById);

module.exports = router;
