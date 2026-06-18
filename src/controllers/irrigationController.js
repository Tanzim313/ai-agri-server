const { recommendIrrigation } = require("../services/irrigationService");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const requiredFields = ["soilMoisture", "temperature", "humidity"];

const validateInput = (body) => {
  const missing = requiredFields.filter((field) => body[field] === undefined || body[field] === null || body[field] === "");

  if (missing.length > 0) {
    return `${missing.join(", ")} required`;
  }

  const numericRules = [
    ["soilMoisture", 0, 100],
    ["temperature", -20, 60],
    ["humidity", 0, 100],
    ["rainfall", 0, 500],
    ["area", 0.01, 1000000]
  ];

  for (const [field, min, max] of numericRules) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      continue;
    }

    const value = Number(body[field]);

    if (!Number.isFinite(value) || value < min || value > max) {
      return `${field} must be a number between ${min} and ${max}`;
    }
  }

  return null;
};

const normalizeInput = (body) => ({
  cropType: body.cropType || null,
  soilMoisture: Number(body.soilMoisture),
  temperature: Number(body.temperature),
  humidity: Number(body.humidity),
  rainfall: Number(body.rainfall || 0),
  area: Number(body.area || 1),
  soilType: body.soilType || "loamy",
  growthStage: body.growthStage || "vegetative",
  location: body.location || null
});

const recommend = async (req, res, next) => {
  try {
    const validationError = validateInput(req.body);

    if (validationError) {
      return errorResponse(res, 400, validationError);
    }

    const input = normalizeInput(req.body);
    const record = await recommendIrrigation({
      userId: req.user._id,
      input
    });

    return successResponse(res, 201, "Irrigation recommendation generated", {
      record
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  recommend
};
