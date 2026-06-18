const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { successResponse } = require("../utils/apiResponse");

const getStats = async (req, res, next) => {
  try {
    const [usersCount, productsCount, ordersCount] = await Promise.all([
      User.collection().countDocuments(),
      Product.collection().countDocuments(),
      Order.collection().countDocuments()
    ]);

    return successResponse(res, 200, "Admin stats fetched successfully", {
      stats: {
        usersCount,
        productsCount,
        ordersCount
      }
    });
  } catch (error) {
    return next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await User.collection()
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return successResponse(res, 200, "Users listed successfully", { users });
  } catch (error) {
    return next(error);
  }
};

const listOrders = async (req, res, next) => {
  try {
    const orders = await Order.collection().find({}).sort({ createdAt: -1 }).toArray();

    return successResponse(res, 200, "Orders listed successfully", {
      orders: orders.map(Order.toPublicOrder)
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getStats,
  listUsers,
  listOrders
};
