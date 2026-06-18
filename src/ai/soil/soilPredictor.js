const getStatus = (value, ranges) => {
  if (value < ranges.low) {
    return "low";
  }

  if (value > ranges.high) {
    return "high";
  }

  return "optimal";
};

const getPhStatus = (ph) => {
  if (ph < 5.5) {
    return "acidic";
  }

  if (ph > 7.5) {
    return "alkaline";
  }

  return "optimal";
};

const buildRecommendation = (analysis) => {
  const recommendations = [];

  if (analysis.nitrogen.status === "low") {
    recommendations.push("Apply nitrogen-rich organic compost or urea in split doses.");
  } else if (analysis.nitrogen.status === "high") {
    recommendations.push("Avoid extra nitrogen fertilizer and increase crop residue management.");
  }

  if (analysis.phosphorus.status === "low") {
    recommendations.push("Apply rock phosphate, DAP, or bone meal based on local soil guidance.");
  } else if (analysis.phosphorus.status === "high") {
    recommendations.push("Avoid phosphorus-heavy fertilizers to reduce nutrient lockup and runoff.");
  }

  if (analysis.potassium.status === "low") {
    recommendations.push("Apply muriate of potash or potassium-rich compost.");
  } else if (analysis.potassium.status === "high") {
    recommendations.push("Reduce potassium fertilizer until the next soil test.");
  }

  if (analysis.ph.status === "acidic") {
    recommendations.push("Apply agricultural lime gradually to raise soil pH.");
  } else if (analysis.ph.status === "alkaline") {
    recommendations.push("Add organic matter and sulfur amendments where locally recommended.");
  }

  if (analysis.moisture.status === "low") {
    recommendations.push("Increase irrigation frequency and add mulch to reduce evaporation.");
  } else if (analysis.moisture.status === "high") {
    recommendations.push("Improve drainage and reduce irrigation until moisture normalizes.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Soil values are within the preferred range. Maintain current fertility and irrigation practices.");
  }

  return recommendations;
};

const calculateHealthScore = (analysis) => {
  const statuses = [
    analysis.nitrogen.status,
    analysis.phosphorus.status,
    analysis.potassium.status,
    analysis.ph.status,
    analysis.moisture.status
  ];

  const optimalCount = statuses.filter((status) => status === "optimal").length;
  return Math.round((optimalCount / statuses.length) * 100);
};

const predictSoil = (input) => {
  const nitrogen = Number(input.nitrogen);
  const phosphorus = Number(input.phosphorus);
  const potassium = Number(input.potassium);
  const ph = Number(input.ph);
  const moisture = Number(input.moisture);

  const analysis = {
    nitrogen: {
      value: nitrogen,
      unit: "mg/kg",
      status: getStatus(nitrogen, { low: 40, high: 120 })
    },
    phosphorus: {
      value: phosphorus,
      unit: "mg/kg",
      status: getStatus(phosphorus, { low: 20, high: 80 })
    },
    potassium: {
      value: potassium,
      unit: "mg/kg",
      status: getStatus(potassium, { low: 80, high: 220 })
    },
    ph: {
      value: ph,
      status: getPhStatus(ph)
    },
    moisture: {
      value: moisture,
      unit: "%",
      status: getStatus(moisture, { low: 35, high: 75 })
    }
  };

  return {
    healthScore: calculateHealthScore(analysis),
    fertilityLevel: calculateHealthScore(analysis) >= 80
      ? "good"
      : calculateHealthScore(analysis) >= 50
        ? "moderate"
        : "poor",
    nutrients: analysis,
    recommendation: buildRecommendation(analysis)
  };
};

module.exports = predictSoil;
module.exports.predictSoil = predictSoil;
