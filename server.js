const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());  // To allow your frontend to access the API

const IPINFO_URL = 'https://ipinfo.io/';
const OPEN_METEO_CURRENT_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_HISTORICAL_URL = 'https://archive-api.open-meteo.com/v1/archive';

app.get('/weather', async (req, res) => {
  try {
    // Get user's location
    const ipInfoResponse = await axios.get(IPINFO_URL);
    const ipInfoData = ipInfoResponse.data;

    const location = ipInfoData.loc.split(',');
    const lat = location[0];
    const lon = location[1];

    // Fetch current weather and 7-day forecast using open-meteo
    const currentWeatherResponse = await axios.get(
      `${OPEN_METEO_CURRENT_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    const currentWeather = currentWeatherResponse.data.current_weather;
    const forecast = currentWeatherResponse.data.daily;

    // Get today's date
    const today = new Date();
    const currentYear = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    let weatherHistory = [];
    let errorLog = [];

    // Fetch historical data from 1940 + (last digit of the previous year) every 5 years up to the last available year
    for (let year = 1940 + ((currentYear - 1) % 10); year <= currentYear - 1; year += 5) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      try {
        // Fetch historical weather data for the given date
        const historicalResponse = await axios.get(
          `${OPEN_METEO_HISTORICAL_URL}?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=temperature_2m_mean`
        );

        const historicalData = historicalResponse.data.daily;
        weatherHistory.push({
          year: year,
          date: date,
          mean_temperature: historicalData.temperature_2m_mean[0] || 'N/A'
        });
      } catch (err) {
        errorLog.push(`Error fetching historical data for ${year}: ${err.message}`);
      }
    }

    // Prepare response data
    res.json({
      ip: ipInfoData.ip,
      lat: lat,
      lon: lon,
      city: ipInfoData.city,
      region: ipInfoData.region,
      country: ipInfoData.country,
      temperature: currentWeather.temperature,
      windSpeed: currentWeather.windspeed,
      weatherCode: currentWeather.weathercode,
      weekWeatherCodes: forecast.weathercode, // Added weather codes for the week
      weekMaxTemperatures: forecast.temperature_2m_max, // Added max temperatures for the week
      weekMinTemperatures: forecast.temperature_2m_min, // Added min temperatures for the week
      weatherHistory: weatherHistory,  // Historical weather data added here
      errors: errorLog,  // Return any errors found during the process
    });

  } catch (error) {
    res.status(500).send(`Error fetching weather data: ${error.message}`);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
