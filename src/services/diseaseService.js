const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const treatments = {
  Apple___Apple_scab: "Remove infected leaves and fallen debris. Apply a labeled fungicide such as captan or sulfur during humid periods and improve air circulation.",
  Apple___Black_rot: "Prune infected branches, remove mummified fruit, and destroy diseased debris. Apply a registered fungicide during the growing season.",
  Apple___Cedar_apple_rust: "Remove nearby alternate juniper hosts where practical. Apply a rust-labeled fungicide at pink bud through petal fall.",
  Apple___healthy: "No disease detected. Continue regular monitoring, balanced watering, sanitation, and preventive orchard hygiene.",
  Blueberry___healthy: "No disease detected. Maintain acidic soil, mulch, good drainage, and routine scouting.",
  "Cherry_(including_sour)___Powdery_mildew": "Prune for airflow, avoid overhead irrigation, and apply sulfur or potassium bicarbonate products according to label directions.",
  "Cherry_(including_sour)___healthy": "No disease detected. Keep the canopy open and monitor leaves weekly.",
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Use resistant hybrids, rotate away from corn residue, and apply foliar fungicide if disease pressure is high before tasseling.",
  "Corn_(maize)___Common_rust_": "Plant resistant varieties and apply a labeled rust fungicide if pustules appear early and weather remains cool and humid.",
  "Corn_(maize)___Northern_Leaf_Blight": "Use resistant hybrids, rotate crops, manage residue, and apply foliar fungicide when lesions spread before silking.",
  "Corn_(maize)___healthy": "No disease detected. Maintain crop nutrition and scout lower leaves regularly.",
  Grape___Black_rot: "Remove mummified berries and infected canes. Apply protectant fungicides from shoot growth through berry development.",
  "Grape___Esca_(Black_Measles)": "Prune out infected wood during dry weather, disinfect tools, and remove severely affected vines from the vineyard.",
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "Remove infected leaves, improve canopy airflow, and use a registered grape fungicide during wet weather.",
  Grape___healthy: "No disease detected. Continue canopy management, sanitation, and preventive scouting.",
  "Orange___Haunglongbing_(Citrus_greening)": "Remove infected trees where required, control psyllid vectors, use certified disease-free planting material, and consult local citrus authorities.",
  Peach___Bacterial_spot: "Use resistant cultivars when possible, avoid overhead irrigation, prune for airflow, and apply copper or oxytetracycline products according to label directions.",
  Peach___healthy: "No disease detected. Keep trees pruned, irrigated evenly, and monitored after rain.",
  "Pepper,_bell___Bacterial_spot": "Remove infected plant debris, avoid overhead watering, rotate crops, and apply copper-based bactericide if recommended locally.",
  "Pepper,_bell___healthy": "No disease detected. Maintain spacing, drip irrigation, and field sanitation.",
  Potato___Early_blight: "Remove infected foliage, rotate with non-host crops, maintain plant vigor, and apply chlorothalonil or mancozeb products according to label directions.",
  Potato___Late_blight: "Remove infected plants quickly, avoid overhead irrigation, improve airflow, and apply a late-blight fungicide program immediately.",
  Potato___healthy: "No disease detected. Continue scouting and avoid excess leaf wetness.",
  Raspberry___healthy: "No disease detected. Maintain cane spacing, sanitation, and proper watering.",
  Soybean___healthy: "No disease detected. Continue field scouting and balanced fertility management.",
  Squash___Powdery_mildew: "Remove badly infected leaves, improve airflow, and apply sulfur, potassium bicarbonate, or a labeled fungicide early.",
  Strawberry___Leaf_scorch: "Remove infected leaves after harvest, improve spacing, avoid overhead irrigation, and apply a labeled fungicide if pressure is high.",
  Strawberry___healthy: "No disease detected. Keep beds clean, mulched, and well drained.",
  Tomato___Bacterial_spot: "Remove infected leaves, avoid overhead irrigation, rotate crops, and apply copper-based bactericide where locally recommended.",
  Tomato___Early_blight: "Remove lower infected leaves, mulch soil, stake plants, rotate crops, and apply chlorothalonil or mancozeb products according to label directions.",
  Tomato___Late_blight: "Destroy infected plants, avoid leaf wetness, increase spacing, and start a labeled late-blight fungicide program immediately.",
  Tomato___Leaf_Mold: "Increase greenhouse ventilation, reduce humidity, remove infected leaves, and apply a labeled fungicide if needed.",
  Tomato___Septoria_leaf_spot: "Remove infected lower leaves, mulch, avoid overhead irrigation, rotate crops, and apply protective fungicide.",
  "Tomato___Spider_mites Two-spotted_spider_mite": "Spray leaves with water to reduce mites, release beneficial predators where practical, and apply miticide if populations remain high.",
  Tomato___Target_Spot: "Remove infected foliage, improve airflow, avoid overhead watering, and use a labeled fungicide rotation.",
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: "Remove infected plants, control whiteflies, use resistant varieties, and install insect-proof nursery protection.",
  Tomato___Tomato_mosaic_virus: "Remove infected plants, disinfect tools, wash hands after handling tobacco or plants, and use certified virus-free seed.",
  Tomato___healthy: "No disease detected. Maintain steady watering, pruning, and weekly scouting."
};

const formatPredictionName = (label) => {
  return String(label || "")
    .replace(/___/g, " - ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const generateTreatment = (prediction) => {
  return treatments[prediction] || "Consult a local agricultural extension officer for field-specific diagnosis and treatment.";
};


const predictDiseaseFromFlask = async (file) => {
  const candidateUrls = [
    process.env.FLASK_AI_URL
  ].filter(Boolean);

  if (candidateUrls.length === 0) {
    throw new Error('FLASK_AI_URL is not configured. Start the Flask AI server and set FLASK_AI_URL');
  }

  const formData = new FormData();
  formData.append('image', file.buffer, { filename: file.originalname });

  let lastError = null;

  for (const flaskUrl of candidateUrls) {
    try {
      const response = await axios.post(`${flaskUrl}/predict-disease`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 45000,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      if (response.data && response.data.success) {
        return {
          prediction: response.data.disease,
          confidence: response.data.confidence
        };
      }

      const upstreamError = response.data?.message || 'Unknown error from Flask AI service';
      throw new Error(upstreamError);
    } catch (error) {
      lastError = error;
      console.warn(`Flask AI request failed for ${flaskUrl}:`, error.message);
    }
  }

  const upstreamMessage = lastError?.response?.data?.message || lastError?.message || 'Flask AI service unavailable';
  throw new Error(`AI Server Communication Error: ${upstreamMessage}`);
};

module.exports = {
  treatments,
  formatPredictionName,
  generateTreatment,
  predictDiseaseFromFlask
};