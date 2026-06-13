document.addEventListener('DOMContentLoaded', () => {
  const weatherForm = document.getElementById('weather-form');
  const cityInput = document.getElementById('city-input');
  const errorDisplay = document.getElementById('error-display');
  const loadingIndicator = document.getElementById('loading-indicator');
  const weatherCard = document.getElementById('weather-card');

  const locationName = document.getElementById('location-name');
  const weatherDescription = document.getElementById('weather-description');
  const tempVal = document.getElementById('temp-val');
  const humidityVal = document.getElementById('humidity-val');
  const windVal = document.getElementById('wind-val');

  weatherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;


    resetDisplayState();

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
      const geoResponse = await fetch(geoUrl);
      
      if (!geoResponse.ok) throw new Error('Network pipeline failed during geolocation fetch.');
      
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Could not find a city matching "${city}". Check your spelling and try again.`);
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
      const weatherResponse = await fetch(weatherUrl);
      
      if (!weatherResponse.ok) throw new Error('Weather metrics provider network connection dropped.');

      const weatherData = await weatherResponse.json();
      const currentMetrics = weatherData.current;

      const conditionString = parseWeatherCode(currentMetrics.weather_code);

      locationName.textContent = `${name}, ${country}`;
      weatherDescription.textContent = conditionString;
      tempVal.innerHTML = `${Math.round(currentMetrics.temperature_2m)}&deg;C`;
      humidityVal.textContent = `${currentMetrics.relative_humidity_2m}%`;
      windVal.textContent = `${currentMetrics.wind_speed_10m} m/s`;

      weatherCard.classList.remove('hidden');

    } catch (error) {
      errorDisplay.textContent = error.message;
      errorDisplay.classList.remove('sr-only');
    } finally {
      loadingIndicator.classList.add('sr-only');
    }
  });

  function resetDisplayState() {
    loadingIndicator.classList.remove('sr-only');
    errorDisplay.classList.add('sr-only');
    errorDisplay.textContent = '';
    weatherCard.classList.add('hidden');
  }

  function parseWeatherCode(code) {
    if (code === 0) return 'Clear Sky';
    if (code >= 1 && code <= 3) return 'Mainly Clear / Partly Cloudy';
    if (code === 45 || code === 48) return 'Foggy Conditions';
    if (code >= 51 && code <= 55) return 'Drizzle Light Rain';
    if (code >= 61 && code <= 65) return 'Rain Showers';
    if (code >= 71 && code <= 75) return 'Snow Fall Fallbacks';
    if (code >= 95) return 'Thunderstorm Activity Detected';
    return 'Variable Conditions';
  }
});