const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

/*
  crop_recommendations collection schema example:
  {
    _id: ObjectId("64bfea12..."),
    userId: ObjectId("64bfd000..."),
    input: {
      nitrogen: 90,
      phosphorus: 55,
      potassium: 140,
      ph: 6.8,
      temperature: 28,
      rainfall: 90,
      humidity: 70,
      soilType: "loamy",
      season: "monsoon",
      location: "Field A"
    },
    recommendations: [
      { crop: "Tomato", suitabilityScore: 91.2, reason: "..." },
      { crop: "Maize", suitabilityScore: 84.5, reason: "..." }
    ],
    createdAt: ISODate("2026-06-18T12:25:00Z")
  }
*/

const collection = () => getDB().collection("crop_recommendations");

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
    input: record.input,
    recommendations: record.recommendations,
    createdAt: record.createdAt
  };
};

module.exports = {
  collection,
  toObjectId,
  toPublicRecord
};
