const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

/*
  orders collection schema example:
  {
    _id: ObjectId("64bfed56..."),
    userId: ObjectId("64bfd000..."),
    items: [
      {
        productId: ObjectId("64bfec34..."),
        name: "Organic Fertilizer",
        imageUrl: "https://res.cloudinary.com/.../product.jpg",
        quantity: 2,
        price: 350.0
      }
    ],
    shippingAddress: {
      address: "123 Farm Road",
      city: "Dhaka",
      postalCode: "1207",
      country: "Bangladesh"
    },
    totalAmount: 700.0,
    status: "pending",
    createdAt: ISODate("2026-06-18T12:35:00Z")
  }
*/

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
