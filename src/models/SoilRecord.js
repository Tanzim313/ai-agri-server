const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

/*
  soil_records collection schema example:
  {
    _id: ObjectId("64bfd456..."),
    userId: ObjectId("64bfd000..."),
    input: {
      nitrogen: 120,
      phosphorus: 60,
      potassium: 150,
      ph: 6.5,
      moisture: 35,
      cropType: "Tomato",
      location: "Farm 1"
    },
    analysis: {
      healthScore: 72,
      fertilityLevel: "moderate",
      nutrients: {
        nitrogen: "adequate",
        phosphorus: "adequate",
        potassium: "good"
      }
    },
    recommendation: "Add compost and maintain balanced irrigation.",
    createdAt: ISODate("2026-06-18T12:20:00Z")
  }
*/

const collection = () => getDB().collection("soil_records");

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
    analysis: record.analysis,
    recommendation: record.recommendation,
    createdAt: record.createdAt
  };
};

module.exports = {
  collection,
  toObjectId,
  toPublicRecord
};
