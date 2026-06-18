const CropRecommendation = require("../models/CropRecommendation");
const { recommendCrops } = require("../services/cropRecommendationService");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const requiredFields = ["nitrogen", "phosphorus", "potassium", "ph", "temperature", "rainfall", "humidity"];

const validateInput = (body) => {
  const missing = requiredFields.filter((field) => body[field] === undefined || body[field] === null || body[field] === "");

  if (missing.length > 0) {
    return `${missing.join(", ")} required`;
  }

  const rules = [
    ["nitrogen", 0, 500],
    ["phosphorus", 0, 500],
    ["potassium", 0, 600],
    ["ph", 0, 14],
    ["temperature", -20, 60],
    ["rainfall", 0, 1000],
    ["humidity", 0, 100]
  ];

  for (const [field, min, max] of rules) {
    const value = Number(body[field]);

    if (!Number.isFinite(value) || value < min || value > max) {
      return `${field} must be a number between ${min} and ${max}`;
    }
  }

  return null;
};

const normalizeInput = (body) => ({
  nitrogen: Number(body.nitrogen),
  phosphorus: Number(body.phosphorus),
  potassium: Number(body.potassium),
  ph: Number(body.ph),
  temperature: Number(body.temperature),
  rainfall: Number(body.rainfall),
  humidity: Number(body.humidity),
  soilType: body.soilType || null,
  season: body.season || null,
  location: body.location || null
});

const recommend = async (req, res, next) => {
  try {
    const validationError = validateInput(req.body);

    if (validationError) {
      return errorResponse(res, 400, validationError);
    }

    const input = normalizeInput(req.body);
    const recommendations = recommendCrops(input);
    const document = {
      userId: req.user._id,
      input,
      recommendations,
      createdAt: new Date()
    };

    const result = await CropRecommendation.collection().insertOne(document);
    const record = {
      _id: result.insertedId,
      ...document
    };

    return successResponse(res, 201, "Crop recommendation generated", {
      record: CropRecommendation.toPublicRecord(record)
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  recommend
};
