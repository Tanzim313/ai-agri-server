const fs = require("fs");
const path = require("path");
const { predictDiseaseFromFlask } = require("./src/services/diseaseService");

(async () => {
  try {
    const testImagePath = path.join(__dirname, "test.png");
    if (!fs.existsSync(testImagePath)) {
      console.error(`Test image not found at ${testImagePath}`);
      process.exit(1);
    }

    const imageBuffer = fs.readFileSync(testImagePath);
    const mockFile = {
      buffer: imageBuffer,
      originalname: "test.png"
    };

    console.log("Sending prediction request to Flask AI server...");
    const result = await predictDiseaseFromFlask(mockFile);
    console.log("Prediction Result:", result);
  } catch (error) {
    console.error("Test execution failed:", error.message);
  }
})();