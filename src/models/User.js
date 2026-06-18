const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const USER_ROLES = Object.freeze({
  FARMER: "farmer",
  ADMIN: "admin"
});

const collection = () => getDB().collection("users");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isValidRole = (role) => Object.values(USER_ROLES).includes(role);

const toObjectId = (id) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
};

const toPublicUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage || null,
    createdAt: user.createdAt
  };
};

module.exports = {
  USER_ROLES,
  collection,
  normalizeEmail,
  isValidRole,
  toObjectId,
  toPublicUser
};
