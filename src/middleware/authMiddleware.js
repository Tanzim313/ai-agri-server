const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { errorResponse } = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return errorResponse(res, 401, "Authentication token is required");
    }

    if (!process.env.JWT_SECRET) {
      return errorResponse(res, 500, "JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = User.toObjectId(decoded.id);

    if (!userId) {
      return errorResponse(res, 401, "Invalid authentication token");
    }

    const user = await User.collection().findOne({ _id: userId });

    if (!user) {
      return errorResponse(res, 401, "Authenticated user no longer exists");
    }

    req.user = User.toPublicUser(user);
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Authentication token expired");
    }

    return errorResponse(res, 401, "Invalid authentication token");
  }
};

module.exports = protect;
module.exports.protect = protect;
