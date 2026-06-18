const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

/*
  chat_history collection schema example:
  {
    _id: ObjectId("64bfef78..."),
    userId: ObjectId("64bfd000..."),
    question: "What is the best fertilizer for tomato?",
    answer: "Use balanced NPK fertilizer with higher potassium and regular soil moisture monitoring.",
    createdAt: ISODate("2026-06-18T12:40:00Z")
  }
*/

const collection = () => getDB().collection("chat_history");

const toObjectId = (id) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return new ObjectId(id);
};

const toPublicRecord = (record) => {
  if (!record) {
    return null;
  }

  return {
    _id: record._id,
    userId: record.userId,
    question: record.question,
    answer: record.answer,
    createdAt: record.createdAt
  };
};

module.exports = {
  collection,
  toObjectId,
  toPublicRecord
};
