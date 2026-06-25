const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getGeminiConfig } = require("../config/gemini");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendMessage = async ({ message }) => {
  const config = getGeminiConfig();

  if (!config.apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const genAI = new GoogleGenerativeAI(config.apiKey);

  const model = genAI.getGenerativeModel({
    model: config.model || "gemini-2.5-flash",
    systemInstruction: config.systemMessage
  });

  const maxRetries = 5;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(message);

      const response = result.response;

      if (!response) {
        throw new Error("Empty response from Gemini.");
      }

      const text = response.text();

      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      return text;
    } catch (error) {
      lastError = error;

      const errorMessage = error?.message || "";

      const isRetryable =
        errorMessage.includes("503") ||
        errorMessage.includes("Service Unavailable") ||
        errorMessage.includes("high demand") ||
        errorMessage.includes("overloaded") ||
        errorMessage.includes("RESOURCE_EXHAUSTED") ||
        errorMessage.includes("429");

      if (!isRetryable || attempt === maxRetries) {
        break;
      }

      const delay = Math.pow(2, attempt) * 1000;

      console.log(
        `Gemini request failed (Attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  console.error("Gemini Error:", lastError);

  throw new Error(
    "AI service is temporarily unavailable. Please try again in a few moments."
  );
};

module.exports = {
  sendMessage
};