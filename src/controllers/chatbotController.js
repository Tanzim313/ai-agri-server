const ChatHistory = require("../models/ChatHistory");
const geminiService = require("../services/geminiService");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return errorResponse(res, 400, "Message is required");
    }

    const answer = await geminiService.sendMessage({
      userId: req.user._id,
      message
    });

    const record = {
      userId: req.user._id,
      question: message,
      answer,
      createdAt: new Date()
    };

    const result = await ChatHistory.collection().insertOne(record);

    return successResponse(res, 200, "Chat response generated successfully", {
      chat: { _id: result.insertedId, ...record }
    });
  } catch (error) {
    return next(error);
  }
};

const history = async (req, res, next) => {
  try {
    const records = await ChatHistory.collection()
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .toArray();

    return successResponse(res, 200, "Chat history fetched successfully", {
      chats: records.map(ChatHistory.toPublicRecord)
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  chat,
  history
};
