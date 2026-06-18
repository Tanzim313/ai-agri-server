const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
};

const validatePassword = (password) => {
  if (!isNonEmptyString(password)) {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  return null;
};

const buildAuthPayload = (user) => ({
  user: User.toPublicUser(user),
  token: generateToken(user)
});

const register = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = User.normalizeEmail(req.body.email);
    const password = req.body.password;
    const role = req.body.role || User.USER_ROLES.FARMER;

    if (!isNonEmptyString(name)) {
      return errorResponse(res, 400, "Name is required");
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, 400, "A valid email is required");
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return errorResponse(res, 400, passwordError);
    }

    if (!User.isValidRole(role)) {
      return errorResponse(res, 400, "Role must be either farmer or admin");
    }

    const existingUser = await User.collection().findOne({ email });
    if (existingUser) {
      return errorResponse(res, 409, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();

    const userDocument = {
      name,
      email,
      password: hashedPassword,
      role,
      profileImage: req.body.profileImage || null,
      createdAt: now
    };

    const result = await User.collection().insertOne(userDocument);
    const createdUser = {
      _id: result.insertedId,
      ...userDocument
    };

    return successResponse(res, 201, "Registration successful", buildAuthPayload(createdUser));
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 409, "Email is already registered");
    }

    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = User.normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!isValidEmail(email) || !isNonEmptyString(password)) {
      return errorResponse(res, 400, "Email and password are required");
    }

    const user = await User.collection().findOne({ email });

    if (!user) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    return successResponse(res, 200, "Login successful", buildAuthPayload(user));
  } catch (error) {
    return next(error);
  }
};

const getProfile = async (req, res) => {
  return successResponse(res, 200, "Profile fetched successfully", {
    user: req.user
  });
};

const updateProfile = async (req, res, next) => {
  try {
    const updates = {};

    if (req.body.name !== undefined) {
      const name = String(req.body.name || "").trim();

      if (!name) {
        return errorResponse(res, 400, "Name cannot be empty");
      }

      updates.name = name;
    }

    if (req.body.email !== undefined) {
      const email = User.normalizeEmail(req.body.email);

      if (!isValidEmail(email)) {
        return errorResponse(res, 400, "A valid email is required");
      }

      const existingUser = await User.collection().findOne({
        email,
        _id: { $ne: req.user._id }
      });

      if (existingUser) {
        return errorResponse(res, 409, "Email is already registered");
      }

      updates.email = email;
    }

    if (req.body.profileImage !== undefined) {
      updates.profileImage = req.body.profileImage || null;
    }

    if (req.body.password !== undefined) {
      const passwordError = validatePassword(req.body.password);

      if (passwordError) {
        return errorResponse(res, 400, passwordError);
      }

      updates.password = await bcrypt.hash(req.body.password, 12);
    }

    if (req.body.role !== undefined) {
      return errorResponse(res, 400, "Role cannot be updated from profile");
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(res, 400, "No valid profile fields provided");
    }

    const result = await User.collection().findOneAndUpdate(
      { _id: req.user._id },
      { $set: updates },
      { returnDocument: "after", projection: { password: 0 } }
    );

    return successResponse(res, 200, "Profile updated successfully", {
      user: result
    });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 409, "Email is already registered");
    }

    return next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
