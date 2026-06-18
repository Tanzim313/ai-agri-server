const soilTypeMultiplier = {
  sandy: 1.25,
  loamy: 1,
  clay: 0.8,
  silt: 0.95,
  peaty: 0.75,
  chalky: 1.1
};

const stageMultiplier = {
  seedling: 0.75,
  vegetative: 1,
  flowering: 1.2,
  fruiting: 1.25,
  maturity: 0.85
};

const predictIrrigation = (input) => {
  const soilMoisture = Number(input.soilMoisture);
  const temperature = Number(input.temperature);
  const humidity = Number(input.humidity);
  const rainfall = Number(input.rainfall || 0);
  const area = Number(input.area || 1);
  const soilType = String(input.soilType || "loamy").toLowerCase();
  const growthStage = String(input.growthStage || "vegetative").toLowerCase();

  let waterNeedMm = 8;

  if (soilMoisture < 25) {
    waterNeedMm += 10;
  } else if (soilMoisture < 40) {
    waterNeedMm += 5;
  } else if (soilMoisture > 75) {
    waterNeedMm -= 8;
  }

  if (temperature > 34) {
    waterNeedMm += 5;
  } else if (temperature > 28) {
    waterNeedMm += 3;
  } else if (temperature < 18) {
    waterNeedMm -= 2;
  }

  if (humidity < 40) {
    waterNeedMm += 3;
  } else if (humidity > 80) {
    waterNeedMm -= 2;
  }

  waterNeedMm -= Math.min(rainfall, 15);
  waterNeedMm *= soilTypeMultiplier[soilType] || 1;
  waterNeedMm *= stageMultiplier[growthStage] || 1;
  waterNeedMm = Math.max(0, Number(waterNeedMm.toFixed(2)));

  const waterLiters = Number((waterNeedMm * area).toFixed(2));
  const shouldIrrigate = waterNeedMm >= 3;

  return {
    shouldIrrigate,
    waterNeedMm,
    waterLiters,
    priority: waterNeedMm >= 12 ? "high" : waterNeedMm >= 6 ? "medium" : "low",
    recommendation: shouldIrrigate
      ? `Apply approximately ${waterNeedMm} mm of water. Prefer early morning or late afternoon irrigation.`
      : "Irrigation is not required now. Recheck soil moisture within 24 hours.",
    factors: {
      soilMoisture,
      temperature,
      humidity,
      rainfall,
      soilType,
      growthStage,
      area
    }
  };
};

module.exports = predictIrrigation;
module.exports.predictIrrigation = predictIrrigation;
