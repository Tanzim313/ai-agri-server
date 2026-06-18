const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

/*
  weather_records collection schema example:
  {
    _id: ObjectId("64bfd789..."),
    userId: ObjectId("64bfd000..."),
    type: "current",
    location: {
      latitude: 23.8103,
      longitude: 90.4125,
      name: "Dhaka"
    },
    weather: {
      observedAt: "2026-06-18T12:20:00Z",
      temperature: 32.1,
      humidity: 78,
      weatherCode: 3,
      windSpeed: 12.4,
      units: {
        temperature: "°C",
        humidity: "%",
        windSpeed: "m/s"
      }
    },
    createdAt: ISODate("2026-06-18T12:21:00Z")
  }
*/

const collection = () => getDB().collection("weather_records");

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
    type: record.type,
    location: record.location,
    weather: record.weather,
    createdAt: record.createdAt
  };
};

module.exports = {
  collection,
  toObjectId,
  toPublicRecord
};
