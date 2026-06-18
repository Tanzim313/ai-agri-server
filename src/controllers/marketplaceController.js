const { ObjectId } = require("mongodb");
const cloudinary = require("../config/cloudinary");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const buildObjectId = (id) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
};

const uploadProductImage = async (file) => {
  if (!file) {
    return null;
  }

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "smart-agriculture/products",
        resource_type: "image",
        transformation: [
          { width: 1200, height: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }
        ]
      },
      (error, uploadResult) => {
        if (error) {
          return reject(error);
        }

        resolve(uploadResult);
      }
    );

    uploadStream.end(file.buffer);
  });

  return result.secure_url;
};

const listProducts = async (req, res, next) => {
  try {
    const filter = {};
    const { q, category } = req.query;

    if (q) {
      filter.$text = { $search: q };
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.collection().find(filter).sort({ createdAt: -1 }).toArray();

    return successResponse(res, 200, "Products listed successfully", {
      products: products.map(Product.toPublicProduct)
    });
  } catch (error) {
    return next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const productId = buildObjectId(req.params.id);

    if (!productId) {
      return errorResponse(res, 400, "Invalid product id");
    }

    const product = await Product.collection().findOne({ _id: productId });

    if (!product) {
      return errorResponse(res, 404, "Product not found");
    }

    return successResponse(res, 200, "Product fetched successfully", {
      product: Product.toPublicProduct(product)
    });
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const imageUrl = await uploadProductImage(req.file);

    if (!name || !description || price === undefined) {
      return errorResponse(res, 400, "Name, description, and price are required");
    }

    const document = {
      name: String(name).trim(),
      description: String(description).trim(),
      price: Number(price),
      category: category ? String(category).trim() : "general",
      stock: Number(stock || 0),
      imageUrl: imageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await Product.collection().insertOne(document);
    const product = { _id: result.insertedId, ...document };

    return successResponse(res, 201, "Product created successfully", {
      product: Product.toPublicProduct(product)
    });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = buildObjectId(req.params.id);

    if (!productId) {
      return errorResponse(res, 400, "Invalid product id");
    }

    const update = {};
    const { name, description, price, category, stock } = req.body;

    if (name !== undefined) update.name = String(name).trim();
    if (description !== undefined) update.description = String(description).trim();
    if (price !== undefined) update.price = Number(price);
    if (category !== undefined) update.category = String(category).trim();
    if (stock !== undefined) update.stock = Number(stock);

    if (req.file) {
      update.imageUrl = await uploadProductImage(req.file);
    }

    if (Object.keys(update).length === 0) {
      return errorResponse(res, 400, "No product fields provided to update");
    }

    update.updatedAt = new Date();

    const result = await Product.collection().findOneAndUpdate(
      { _id: productId },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result.value) {
      return errorResponse(res, 404, "Product not found");
    }

    return successResponse(res, 200, "Product updated successfully", {
      product: Product.toPublicProduct(result.value)
    });
  } catch (error) {
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const productId = buildObjectId(req.params.id);

    if (!productId) {
      return errorResponse(res, 400, "Invalid product id");
    }

    const result = await Product.collection().findOneAndDelete({ _id: productId });

    if (!result.value) {
      return errorResponse(res, 404, "Product not found");
    }

    return successResponse(res, 200, "Product deleted successfully", {
      product: Product.toPublicProduct(result.value)
    });
  } catch (error) {
    return next(error);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 400, "Order items are required");
    }

    const normalizedItems = items.map((item) => ({
      productId: buildObjectId(item.productId),
      name: item.name ? String(item.name).trim() : "",
      imageUrl: item.imageUrl || null,
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0)
    }));

    if (normalizedItems.some((item) => !item.productId || item.quantity < 1 || item.price < 0)) {
      return errorResponse(res, 400, "Each order item must include a valid productId, quantity, and price");
    }

    const document = {
      userId: req.user._id,
      items: normalizedItems,
      shippingAddress: shippingAddress || null,
      totalAmount: normalizedItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
      status: "pending",
      createdAt: new Date()
    };

    const result = await Order.collection().insertOne(document);
    const order = { _id: result.insertedId, ...document };

    return successResponse(res, 201, "Order created successfully", {
      order: Order.toPublicOrder(order)
    });
  } catch (error) {
    return next(error);
  }
};

const orderHistory = async (req, res, next) => {
  try {
    const filter = req.user.role === "admin" ? {} : { userId: req.user._id };
    const orders = await Order.collection().find(filter).sort({ createdAt: -1 }).toArray();

    return successResponse(res, 200, "Order history fetched successfully", {
      orders: orders.map(Order.toPublicOrder)
    });
  } catch (error) {
    return next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const orderId = buildObjectId(req.params.id);

    if (!orderId) {
      return errorResponse(res, 400, "Invalid order id");
    }

    const order = await Order.collection().findOne({ _id: orderId });

    if (!order) {
      return errorResponse(res, 404, "Order not found");
    }

    if (req.user.role !== "admin" && order.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "You do not have permission to view this order");
    }

    return successResponse(res, 200, "Order fetched successfully", {
      order: Order.toPublicOrder(order)
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createOrder,
  orderHistory,
  getOrderById
};
