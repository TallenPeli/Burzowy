import React, { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

// Importing images from ../img folder
import cloud from './img/cloud_3d.png';
import cloudWithLightning from './img/cloud_with_lightning_3d.png';
import cloudWithLightningAndRain from './img/cloud_with_lightning_and_rain_3d.png';
import cloudWithSnow from './img/cloud_with_snow_3d.png';
import rainbow from './img/rainbow_3d.png';
import sun from './img/sun_3d.png';
import sunBehindCloud from './img/sun_behind_cloud_3d.png';
import sunBehindLargeCloud from './img/sun_behind_large_cloud_3d.png';
import sunBehindRainCloud from './img/sun_behind_rain_cloud_3d.png';

const getWeatherEmojis = (weatherCodes) => {
  return weatherCodes.map(code => {
    switch (code) {
      case 0:
        return "☀️"; // Clear sky
      case 1:
      case 2:
      case 3:
        return "🌤️"; // Few clouds
      case 45:
      case 48:
        return "☁️"; // Overcast
      case 51:
      case 53:
      case 55:
        return "🌧️"; // Light rain
      case 56:
      case 57:
      case 61:
      case 63:
      case 65:
        return "⛈️"; // Thunderstorm
      case 66:
      case 67:
        return "🌧️"; // Heavy rain
      case 80:
      case 81:
      case 82:
        return "🌩️"; // Rain showers
      case 85:
      case 86:
        return "❄️"; // Snow showers
      case 95:
      case 96:
      case 99:
        return "🌈"; // Thunderstorms with rain
      default:
        return "☁️"; // Default case (cloudy)
    }
  });
};

const makeLabelsUnique = (labels) => {
  return labels.map((label, index) => label + "\u200B".repeat(index)); // Add unique zero-width spaces
};

function ChartsOverviewDemo({ weekMaxTemperatures, weekWeatherCodes }) {
  const weekData = weekMaxTemperatures ? weekMaxTemperatures : [];
  const weekLabels = makeLabelsUnique(getWeatherEmojis(weekWeatherCodes));

  return (
    <LineChart
      sx={() => ({
        [`.${axisClasses.root}`]: {
          [`.${axisClasses.tick}, .${axisClasses.line}`]: {
            stroke: '#fff',
            strokeWidth: 3,
          },
          [`.${axisClasses.tickLabel}`]: {
            fill: '#ffffff',
          },
        },
      })}
      xAxis={[{ data: weekLabels, scaleType: 'band' }]} // Display weather emojis as labels
      series={[
        {
          data: weekData,
          color: '#ff5722',
        },
      ]}
      borderRadius={50}
      height={225}
    />
  );
}

function HistoricalWeatherChart({ weatherHistory }) {
  const historicalData = weatherHistory.map(item => item.mean_temperature || 0);
  const historicalLabels = weatherHistory.map(item => item.year);

  return (
    <LineChart
      sx={() => ({
        [`.${axisClasses.root}`]: {
          [`.${axisClasses.tick}, .${axisClasses.line}`]: {
            stroke: '#fff',
            strokeWidth: 3,
          },
          [`.${axisClasses.tickLabel}`]: {
            fill: '#ffffff',
          },
        },
      })}
      xAxis={[{ data: historicalLabels, scaleType: 'band' }]} // Display year as labels
      series={[
        {
          data: historicalData,
          color: '#ff5722',
        },
      ]}
      borderRadius={50}
      height={225}
    />
  );
}

function WeatherApp() {
  const [ip, setIp] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('');
  const [temperature, setTemperature] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [windDirection, setWindDirection] = useState('');
  const [weekWeatherCodes, setWeekWeatherCodes] = useState([]); // Initialize as array
  const [weekMaxTemperatures, setWeekMaxTemperatures] = useState([]); // Initialize as array
  const [weatherHistory, setWeatherHistory] = useState([]); // Initialize historical weather data
  const [icon, setIcon] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch('http://localhost:5000/weather');
        const data = await response.json();

        setIp(data.ip);
        setLat(data.lat);
        setLon(data.lon);
        setCity(data.city);
        setRegion(data.region);
        setCountry(data.country);
        setTemperature(data.temperature);
        setWindSpeed(data.windSpeed);
        setWindDirection(data.windDirection);
        setWeekWeatherCodes(data.weekWeatherCodes); // Now it's an array
        setWeekMaxTemperatures(data.weekMaxTemperatures); // Now it's an array
        setWeatherHistory(data.weatherHistory); // Set historical data

        let weatherIcon;
        let bgClass;
        switch (data.weatherCode) {
          case 0:
            weatherIcon = sun;
            bgClass = 'sunny';
            break;
          case 1:
          case 2:
          case 3:
            weatherIcon = sunBehindCloud;
            bgClass = 'cloudy';
            break;
          case 45:
          case 48:
            weatherIcon = cloud;
            bgClass = 'cloudy';
            break;
          case 51:
          case 53:
          case 55:
            weatherIcon = cloudWithSnow;
            bgClass = 'cloudy';
            break;
          case 56:
          case 57:
          case 61:
          case 63:
          case 65:
            weatherIcon = cloudWithLightningAndRain;
            bgClass = 'stormy';
            break;
          case 66:
          case 67:
          case 71:
          case 73:
          case 75:
          case 77:
            weatherIcon = sunBehindRainCloud;
            bgClass = 'cloudy';
            break;
          case 80:
          case 81:
          case 82:
            weatherIcon = cloudWithLightning;
            bgClass = 'rainy';
            break;
          case 85:
          case 86:
            weatherIcon = sunBehindLargeCloud;
            bgClass = 'cloudy';
            break;
          case 95:
          case 96:
          case 99:
            weatherIcon = rainbow;
            bgClass = 'sunny';
            break;
          default:
            weatherIcon = cloud;
            bgClass = 'cloudy';
        }

        setIcon(weatherIcon);
        const currentHour = new Date().getHours();
        if (currentHour >= 18 || currentHour < 6) {
          document.body.className = 'night';
        } else {
          document.body.className = bgClass;
        }
      } catch (error) {
        setError('Error fetching weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="weather-container">
      <h1 className="weather-title">Weather in {city}, {region}, {country}</h1>
      <div className="weather-info">
        <img src={icon} alt="Weather Icon" className="weather-icon" />
        <div className="temperature">{Math.round(temperature)}°C</div>
      </div>
      <ChartsOverviewDemo
        weekMaxTemperatures={weekMaxTemperatures}
        weekWeatherCodes={weekWeatherCodes}
      />
      <HistoricalWeatherChart weatherHistory={weatherHistory} /> {/* Added historical chart */}
      <div className="wind">
        Wind: {windSpeed} km/h
      </div>
      <div className="wind-direction-label">Direction: {windDirection}°</div>
      <div className="ip">IP: {ip}</div>
    </div>
  );
}

export default WeatherApp;
