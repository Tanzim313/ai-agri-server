const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const labels = require("./labels.json");

const IMAGE_SIZE = 224;
const CHANNELS = 3;
const MODEL_PATH = path.join(__dirname, "plant_disease_model.tflite");

let interpreter;

const getNodeTflite = () => {
  try {
    return require("node-tflite");
  } catch (error) {
    throw new Error(
      "TFLite runtime is not available. Install optional dependency node-tflite with a working native build toolchain."
    );
  }
};

const loadModel = () => {
  if (interpreter) {
    return interpreter;
  }

  if (!fs.existsSync(MODEL_PATH)) {
    throw new Error(`TFLite model file not found at ${MODEL_PATH}`);
  }

  const { Interpreter } = getNodeTflite();
  const modelData = fs.readFileSync(MODEL_PATH);

  interpreter = new Interpreter(modelData);
  interpreter.allocateTensors();

  return interpreter;
};

const loadImageBuffer = async (imageSource) => {
  if (Buffer.isBuffer(imageSource)) {
    return imageSource;
  }

  if (typeof imageSource !== "string") {
    throw new Error("Image source must be a file path, URL, or Buffer");
  }

  if (/^https?:\/\//i.test(imageSource)) {
    const response = await fetch(imageSource);

    if (!response.ok) {
      throw new Error(`Unable to download image from Cloudinary: HTTP ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  if (!fs.existsSync(imageSource)) {
    throw new Error(`Image file not found at ${imageSource}`);
  }

  return fs.readFileSync(imageSource);
};

const normalizePixel = (value) => {
  const mode = process.env.DISEASE_MODEL_NORMALIZATION || "zero_to_one";

  if (mode === "minus_one_to_one") {
    return value / 127.5 - 1;
  }

  return value / 255;
};

const preprocessImage = async (imageSource) => {
  const inputBuffer = await loadImageBuffer(imageSource);
  const rawPixels = await sharp(inputBuffer)
    .rotate()
    .resize(IMAGE_SIZE, IMAGE_SIZE, {
      fit: "cover",
      position: "centre"
    })
    .removeAlpha()
    .raw()
    .toBuffer();

  const input = new Float32Array(IMAGE_SIZE * IMAGE_SIZE * CHANNELS);

  for (let i = 0; i < rawPixels.length; i += 1) {
    input[i] = normalizePixel(rawPixels[i]);
  }

  return input;
};

const toArray = (output) => {
  if (Array.isArray(output)) {
    return output;
  }

  return Array.from(output);
};

const softmax = (values) => {
  const max = Math.max(...values);
  const exps = values.map((value) => Math.exp(value - max));
  const total = exps.reduce((sum, value) => sum + value, 0);

  return exps.map((value) => value / total);
};

const normalizeOutput = (values) => {
  const sum = values.reduce((total, value) => total + value, 0);
  const looksLikeProbabilities = values.every((value) => value >= 0 && value <= 1) && sum > 0.95 && sum < 1.05;

  return looksLikeProbabilities ? values : softmax(values);
};

const runInference = (inputData) => {
  const model = loadModel();
  const inputTensor = model.inputs && model.inputs[0];
  const outputTensor = model.outputs && model.outputs[0];

  if (!inputTensor || !outputTensor) {
    throw new Error("TFLite model input or output tensor is not accessible");
  }

  inputTensor.copyFrom(inputData);
  model.invoke();

  const outputSize = labels.length;
  const outputData = new Float32Array(outputSize);
  outputTensor.copyTo(outputData);

  return toArray(outputData);
};

const predictDisease = async (imageSource) => {
  if (!Array.isArray(labels) || labels.length !== 38) {
    throw new Error("labels.json must contain exactly 38 disease classes");
  }

  const inputData = await preprocessImage(imageSource);
  const rawOutput = runInference(inputData);
  const probabilities = normalizeOutput(rawOutput.slice(0, labels.length));

  let bestIndex = 0;

  for (let i = 1; i < probabilities.length; i += 1) {
    if (probabilities[i] > probabilities[bestIndex]) {
      bestIndex = i;
    }
  }

  return {
    prediction: labels[bestIndex],
    confidence: Number((probabilities[bestIndex] * 100).toFixed(2))
  };
};

module.exports = predictDisease;
module.exports.predictDisease = predictDisease;
module.exports.preprocessImage = preprocessImage;
