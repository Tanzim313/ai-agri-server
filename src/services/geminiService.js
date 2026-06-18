const { getGeminiConfig } = require("../config/gemini");

const formatMessages = ({ message, userId }) => {
  return [
    { role: "system", content: getGeminiConfig().systemMessage },
    { role: "user", content: message }
  ];
};

const sendMessage = async ({ userId, message }) => {
  const config = getGeminiConfig();

  if (!config.apiKey || !config.apiUrl) {
    return "Gemini configuration not found. Please set GEMINI_API_KEY and GEMINI_API_URL in your environment.";
  }

  const payload = {
    model: config.model,
    messages: formatMessages({ message, userId })
  };

  const response = await fetch(config.apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Gemini API request failed: ${response.status} ${errorText}`);
    error.statusCode = 502;
    throw error;
  }

  const result = await response.json();

  if (result?.choices?.[0]?.message?.content) {
    return result.choices[0].message.content;
  }

  if (result?.output?.text) {
    return result.output.text;
  }

  return "The AI assistant could not generate a response.";
};

module.exports = {
  sendMessage
};
