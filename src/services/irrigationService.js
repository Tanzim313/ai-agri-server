const { getDB } = require("../config/db");
const predictIrrigation = require("../ai/irrigation/irrigationPredictor");

const saveIrrigationRecommendation = async ({ userId, input, recommendation }) => {
  const document = {
    userId,
    input,
    recommendation,
    createdAt: new Date()
  };

  const result = await getDB().collection("irrigation_recommendations").insertOne(document);

  return {
    _id: result.insertedId,
    ...document
  };
};

const recommendIrrigation = async ({ userId, input }) => {
  const recommendation = predictIrrigation(input);
  return saveIrrigationRecommendation({ userId, input, recommendation });
};

module.exports = {
  recommendIrrigation,
  saveIrrigationRecommendation
};
