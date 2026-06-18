const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const collection = () => getDB().collection("orders");

const toObjectId = (id) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
};

const toPublicOrder = (order) => {
  if (!order) {
    return null;
  }

  return {
    _id: order._id,
    userId: order.userId,
    items: order.items,
    shippingAddress: order.shippingAddress,
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt
  };
};

module.exports = {
  collection,
  toObjectId,
  toPublicOrder
};
