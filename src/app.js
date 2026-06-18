const express = require("express");
const cors = require("cors");
const multer = require("multer");

const authRoutes = require("./routes/authRoutes");
const diseaseRoutes = require("./routes/diseaseRoutes");
const soilRoutes = require("./routes/soilRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const irrigationRoutes = require("./routes/irrigationRoutes");
const cropRoutes = require("./routes/cropRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { errorResponse } = require("./utils/apiResponse");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Agriculture API"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/disease", diseaseRoutes);
app.use("/api/soil", soilRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/irrigation", irrigationRoutes);
app.use("/api/crop", cropRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  return errorResponse(res, 404, "Route not found");
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const message = error.code === "LIMIT_FILE_SIZE"
      ? "Image file size must not exceed 5MB"
      : error.message;

    return errorResponse(res, 400, message);
  }

  const statusCode = error.statusCode || error.status || 500;
  const message = statusCode === 500
    ? "Internal server error"
    : error.message;

  return errorResponse(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === "production" ? undefined : error.message
  );
});

module.exports = app;
