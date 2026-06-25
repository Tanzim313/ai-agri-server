const getGeminiConfig = () => ({
  apiKey: process.env.GEMINI_API_KEY || null,
  apiUrl: process.env.GEMINI_API_URL || null,
  model: process.env.GEMINI_MODEL || "gpt-4o-mini",
  systemMessage: process.env.GEMINI_SYSTEM_MESSAGE || "You are a smart agriculture assistant. Answer user questions clearly and helpfully."
});

module.exports = {
  getGeminiConfig
};