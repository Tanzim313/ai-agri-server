const WeatherRecord = require("../models/WeatherRecord");
const weatherService = require("../services/weatherService");
const { successResponse } = require("../utils/apiResponse");

const saveWeatherRecord = async ({ userId, type, location, weather }) => {
  const document = {
    userId,
    type,
    location,
    weather,
    createdAt: new Date()
  };

  const result = await WeatherRecord.collection().insertOne(document);

  return {
    _id: result.insertedId,
    ...document
  };
};

const current = async (req, res, next) => {
  try {
    const location = weatherService.buildLocation(req.query);
    const weather = await weatherService.getCurrentWeather(location);
    const record = await saveWeatherRecord({
      userId: req.user._id,
      type: "current",
      location,
      weather
    });

    return successResponse(res, 200, "Current weather fetched successfully", {
      record: WeatherRecord.toPublicRecord(record)
    });
  } catch (error) {
    return next(error);
  }
};

const forecast = async (req, res, next) => {
  try {
    const location = weatherService.buildLocation(req.query);
    const weather = await weatherService.getForecast(location, req.query.days);
    const record = await saveWeatherRecord({
      userId: req.user._id,
      type: "forecast",
      location,
      weather
    });

    return successResponse(res, 200, "Weather forecast fetched successfully", {
      record: WeatherRecord.toPublicRecord(record)
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

    if (req.query.type) {
      filter.type = req.query.type;
    }

    const [records, total] = await Promise.all([
      WeatherRecord.collection().find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      WeatherRecord.collection().countDocuments(filter)
    ]);

    return successResponse(
      res,
      200,
      "Weather history fetched successfully",
      { records: records.map(WeatherRecord.toPublicRecord) },
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  current,
  forecast,
  history
};
