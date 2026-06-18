const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

/*
  products collection schema example:
  {
    _id: ObjectId("64bfec34..."),
    name: "Organic Fertilizer",
    description: "Balanced NPK fertilizer for vegetables.",
    price: 350.0,
    category: "fertilizer",
    stock: 50,
    imageUrl: "https://res.cloudinary.com/.../product.jpg",
    createdAt: ISODate("2026-06-18T12:30:00Z"),
    updatedAt: ISODate("2026-06-18T12:30:00Z")
  }
*/

const collection = () => getDB().collection("products");

const toObjectId = (id) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
};

const toPublicProduct = (product) => {
  if (!product) {
    return null;
  }

  return {
    _id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    stock: product.stock,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt
  };
};

module.exports = {
  collection,
  toObjectId,
  toPublicProduct
};
