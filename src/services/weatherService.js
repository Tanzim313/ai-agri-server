const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";

const numberFromQuery = (value, fieldName, min, max) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    const error = new Error(`${fieldName} must be a number between ${min} and ${max}`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
};

const buildLocation = (query) => {
  return {
    latitude: numberFromQuery(query.lat || query.latitude, "lat", -90, 90),
    longitude: numberFromQuery(query.lon || query.longitude, "lon", -180, 180),
    name: query.location || query.name || null
  };
};

const fetchOpenMeteo = async (params) => {
  const url = new URL(OPEN_METEO_BASE_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error(`Weather provider request failed with status ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  return response.json();
};

const getCurrentWeather = async (location) => {
  const data = await fetchOpenMeteo({
    latitude: location.latitude,
    longitude: location.longitude,
    current_weather: true,
    hourly: "relativehumidity_2m",
    timezone: "auto"
  });

  const humidity = Array.isArray(data.hourly?.relativehumidity_2m)
    ? data.hourly.relativehumidity_2m[0]
    : null;

  return {
    observedAt: data.current_weather?.time || null,
    temperature: data.current_weather?.temperature || null,
    humidity,
    weatherCode: data.current_weather?.weathercode || null,
    windSpeed: data.current_weather?.windspeed || null,
    windDirection: data.current_weather?.winddirection || null,
    units: {
      temperature: data.hourly_units?.temperature_2m || null,
      humidity: data.hourly_units?.relativehumidity_2m || null,
      windSpeed: data.hourly_units?.windspeed_10m || null
    }
  };
};

const getForecast = async (location, days = 7) => {
  const forecastDays = Math.min(Math.max(Number.parseInt(days, 10) || 7, 1), 16);
  const data = await fetchOpenMeteo({
    latitude: location.latitude,
    longitude: location.longitude,
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "rain_sum",
      "wind_speed_10m_max"
    ].join(","),
    forecast_days: forecastDays,
    timezone: "auto"
  });

  const daily = Array.isArray(data.daily?.time)
    ? data.daily.time.map((date, index) => ({
        date,
        weatherCode: data.daily.weather_code?.[index] ?? null,
        temperatureMax: data.daily.temperature_2m_max?.[index] ?? null,
        temperatureMin: data.daily.temperature_2m_min?.[index] ?? null,
        precipitation: data.daily.precipitation_sum?.[index] ?? null,
        rain: data.daily.rain_sum?.[index] ?? null,
        windSpeedMax: data.daily.wind_speed_10m_max?.[index] ?? null
      }))
    : [];

  return {
    days: daily,
    units: data.daily_units || {}
  };
};

module.exports = {
  buildLocation,
  getCurrentWeather,
  getForecast
};
