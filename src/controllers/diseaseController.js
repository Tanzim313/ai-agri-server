const DiseaseRecord = require("../models/DiseaseRecord");
const cloudinary = require("../config/cloudinary");
const { generateTreatment, predictDiseaseFromFlask } = require("../services/diseaseService");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const buildOwnerFilter = (req, reportId) => {
  const filter = { _id: reportId };

  if (req.user.role !== "admin") {
    filter.userId = req.user._id;
  }

  return filter;
};

const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "smart-agriculture/disease",
        resource_type: "image",
        transformation: [
          {
            width: 1200,
            height: 1200,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto"
          }
        ]
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
};

const predict = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "Disease image file is required");
    }

    const uploadResult = await uploadImageToCloudinary(req.file);
    const imageUrl = uploadResult.secure_url;

    if (!imageUrl) {
      return errorResponse(res, 500, "Cloudinary did not return an image URL");
    }

    // Call the AI model service (Flask). If it fails, return a 503 with details.
    let predictionResult;
    try {
      predictionResult = await predictDiseaseFromFlask(req.file);
    } catch (err) {
      const message = err && err.message ? err.message : 'AI prediction service failed';
      return errorResponse(res, 503, `AI service error: ${message}`);
    }

    const treatment = generateTreatment(predictionResult.prediction);
    const now = new Date();

    const diseaseRecord = {
      userId: req.user._id,
      imageUrl,
      prediction: predictionResult.prediction,
      confidence: predictionResult.confidence,
      treatment,
      createdAt: now
    };

    const result = await DiseaseRecord.collection().insertOne(diseaseRecord);
    const createdRecord = {
      _id: result.insertedId,
      ...diseaseRecord
    };

    return successResponse(res, 201, "Disease prediction completed", {
      report: DiseaseRecord.toPublicRecord(createdRecord)
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
      DiseaseRecord.collection()
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      DiseaseRecord.collection().countDocuments(filter)
    ]);

    return successResponse(
      res,
      200,
      "Disease history fetched successfully",
      {
        reports: records.map(DiseaseRecord.toPublicRecord)
      },
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    );
  } catch (error) {
    return next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const reportId = DiseaseRecord.toObjectId(req.params.id);

    if (!reportId) {
      return errorResponse(res, 400, "Invalid disease report id");
    }

    const report = await DiseaseRecord.collection().findOne(buildOwnerFilter(req, reportId));

    if (!report) {
      return errorResponse(res, 404, "Disease report not found");
    }

    return successResponse(res, 200, "Disease report fetched successfully", {
      report: DiseaseRecord.toPublicRecord(report)
    });
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const reportId = DiseaseRecord.toObjectId(req.params.id);

    if (!reportId) {
      return errorResponse(res, 400, "Invalid disease report id");
    }

    const result = await DiseaseRecord.collection().findOneAndDelete(buildOwnerFilter(req, reportId));

    if (!result) {
      return errorResponse(res, 404, "Disease report not found");
    }

    return successResponse(res, 200, "Disease report deleted successfully", {
      report: DiseaseRecord.toPublicRecord(result)
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  predict,
  history,
  getById,
  remove
};
