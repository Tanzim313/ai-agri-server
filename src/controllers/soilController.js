const SoilRecord = require("../models/SoilRecord");
const predictSoil = require("../ai/soil/soilPredictor");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const requiredFields = ["nitrogen", "phosphorus", "potassium", "ph", "moisture"];

const numberField = (body, field, min, max) => {
  const value = Number(body[field]);

  if (!Number.isFinite(value) || value < min || value > max) {
    return `${field} must be a number between ${min} and ${max}`;
  }

  return null;
};

const validateSoilInput = (body) => {
  const missing = requiredFields.filter((field) => body[field] === undefined || body[field] === null || body[field] === "");

  if (missing.length > 0) {
    return `${missing.join(", ")} required`;
  }

  return (
    numberField(body, "nitrogen", 0, 500) ||
    numberField(body, "phosphorus", 0, 500) ||
    numberField(body, "potassium", 0, 600) ||
    numberField(body, "ph", 0, 14) ||
    numberField(body, "moisture", 0, 100)
  );
};

const normalizeSoilInput = (body) => ({
  nitrogen: Number(body.nitrogen),
  phosphorus: Number(body.phosphorus),
  potassium: Number(body.potassium),
  ph: Number(body.ph),
  moisture: Number(body.moisture),
  cropType: body.cropType || null,
  location: body.location || null
});

const ownerFilter = (req, recordId) => {
  const filter = { _id: recordId };

  if (req.user.role !== "admin") {
    filter.userId = req.user._id;
  }

  return filter;
};

const analyze = async (req, res, next) => {
  try {
    const validationError = validateSoilInput(req.body);

    if (validationError) {
      return errorResponse(res, 400, validationError);
    }

    const input = normalizeSoilInput(req.body);
    const analysisResult = predictSoil(input);
    const document = {
      userId: req.user._id,
      input,
      analysis: {
        healthScore: analysisResult.healthScore,
        fertilityLevel: analysisResult.fertilityLevel,
        nutrients: analysisResult.nutrients
      },
      recommendation: analysisResult.recommendation,
      createdAt: new Date()
    };

    const result = await SoilRecord.collection().insertOne(document);
    const record = {
      _id: result.insertedId,
      ...document
    };

    return successResponse(res, 201, "Soil analysis completed", {
      record: SoilRecord.toPublicRecord(record)
    });
  } catch (error) {
    return next(error);
  }
};

const history = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;
    const filter = req.user.role === "admin" ? {} : { userId: req.user._id };

    const [records, total] = await Promise.all([
      SoilRecord.collection().find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      SoilRecord.collection().countDocuments(filter)
    ]);

    return successResponse(
      res,
      200,
      "Soil history fetched successfully",
      { records: records.map(SoilRecord.toPublicRecord) },
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const recordId = SoilRecord.toObjectId(req.params.id);

    if (!recordId) {
      return errorResponse(res, 400, "Invalid soil record id");
    }

    const record = await SoilRecord.collection().findOne(ownerFilter(req, recordId));

    if (!record) {
      return errorResponse(res, 404, "Soil record not found");
    }

    return successResponse(res, 200, "Soil record fetched successfully", {
      record: SoilRecord.toPublicRecord(record)
    });
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const recordId = SoilRecord.toObjectId(req.params.id);

    if (!recordId) {
      return errorResponse(res, 400, "Invalid soil record id");
    }

    const record = await SoilRecord.collection().findOneAndDelete(ownerFilter(req, recordId));

    if (!record) {
      return errorResponse(res, 404, "Soil record not found");
    }

    return successResponse(res, 200, "Soil record deleted successfully", {
      record: SoilRecord.toPublicRecord(record)
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  analyze,
  history,
  getById,
  remove
};
