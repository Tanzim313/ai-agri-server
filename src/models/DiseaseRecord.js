const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

/*
  disease_records collection schema example:
  {
    _id: ObjectId("64bfd123..."),
    userId: ObjectId("64bfd000..."),
    imageUrl: "https://res.cloudinary.com/.../disease.jpg",
    prediction: "Tomato___Early_blight",
    confidence: 0.92,
    treatment: "Remove lower infected leaves, mulch soil, stake plants, rotate crops, and apply chlorothalonil or mancozeb products.",
    createdAt: ISODate("2026-06-18T12:15:00Z")
  }
*/

const collection = () => getDB().collection("disease_records");

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
    imageUrl: record.imageUrl,
    prediction: record.prediction,
    confidence: record.confidence,
    treatment: record.treatment,
    createdAt: record.createdAt
  };
};

module.exports = {
  collection,
  toObjectId,
  toPublicRecord
};
