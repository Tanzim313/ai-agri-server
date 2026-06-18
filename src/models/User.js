const { getDB } = require("../config/db");

const collection = () =>
  getDB().collection("users");

module.exports = {
  collection
};