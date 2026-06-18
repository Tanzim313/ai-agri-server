const cropProfiles = [
  {
    crop: "Rice",
    ideal: { nitrogen: [70, 160], phosphorus: [25, 80], potassium: [80, 220], ph: [5.5, 7], temperature: [22, 35], rainfall: [120, 300], humidity: [60, 90] }
  },
  {
    crop: "Wheat",
    ideal: { nitrogen: [60, 140], phosphorus: [20, 70], potassium: [80, 200], ph: [6, 7.5], temperature: [12, 25], rainfall: [40, 120], humidity: [45, 75] }
  },
  {
    crop: "Maize",
    ideal: { nitrogen: [70, 150], phosphorus: [25, 75], potassium: [90, 220], ph: [5.8, 7.5], temperature: [18, 32], rainfall: [50, 180], humidity: [45, 80] }
  },
  {
    crop: "Potato",
    ideal: { nitrogen: [50, 120], phosphorus: [35, 90], potassium: [120, 260], ph: [5, 6.8], temperature: [15, 25], rainfall: [40, 120], humidity: [55, 85] }
  },
  {
    crop: "Tomato",
    ideal: { nitrogen: [50, 130], phosphorus: [30, 85], potassium: [120, 280], ph: [5.8, 7.2], temperature: [18, 30], rainfall: [40, 140], humidity: [50, 80] }
  },
  {
    crop: "Soybean",
    ideal: { nitrogen: [25, 80], phosphorus: [20, 70], potassium: [80, 220], ph: [6, 7.5], temperature: [20, 32], rainfall: [45, 160], humidity: [50, 85] }
  },
  {
    crop: "Cotton",
    ideal: { nitrogen: [50, 140], phosphorus: [20, 70], potassium: [100, 240], ph: [6, 8], temperature: [24, 36], rainfall: [40, 130], humidity: [40, 75] }
  }
];

const scoreRange = (value, [min, max]) => {
  if (!Number.isFinite(value)) {
    return 0.5;
  }

  if (value >= min && value <= max) {
    return 1;
  }

  const distance = value < min ? min - value : value - max;
  const tolerance = Math.max(max - min, 1);
  return Math.max(0, 1 - distance / tolerance);
};

const recommendCrops = (input) => {
  const values = {
    nitrogen: Number(input.nitrogen),
    phosphorus: Number(input.phosphorus),
    potassium: Number(input.potassium),
    ph: Number(input.ph),
    temperature: Number(input.temperature),
    rainfall: Number(input.rainfall),
    humidity: Number(input.humidity)
  };

  return cropProfiles
    .map((profile) => {
      const scores = Object.entries(profile.ideal).map(([field, range]) => scoreRange(values[field], range));
      const score = scores.reduce((sum, value) => sum + value, 0) / scores.length;

      return {
        crop: profile.crop,
        suitabilityScore: Number((score * 100).toFixed(2)),
        reason: `${profile.crop} matches ${Math.round(score * 100)}% of the submitted soil and climate profile.`
      };
    })
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .slice(0, 5);
};

module.exports = {
  recommendCrops
};
