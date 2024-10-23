use actix_web::{get, App, HttpResponse, HttpServer, Responder};
use chrono::prelude::*;
use reqwest;
use serde::{Deserialize, Serialize};

const IPINFO_URL: &str = "https://ipinfo.io/";
const OPEN_METEO_CURRENT_URL: &str = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_HISTORICAL_URL: &str = "https://archive-api.open-meteo.com/v1/archive";

#[derive(Deserialize, Serialize)]
struct IpInfo {
    ip: String,
    city: String,
    region: String,
    country: String,
    loc: String,
}

#[derive(Deserialize, Serialize)]
struct WeatherResponse {
    temperature: f64,
    windspeed: f64,
    weathercode: i32,
}

#[derive(Deserialize, Serialize)]
struct Forecast {
    weathercode: Vec<i32>,
    temperature_2m_max: Vec<f64>,
    temperature_2m_min: Vec<f64>,
}

#[derive(Deserialize, Serialize)]
struct WeatherHistory {
    year: i32,
    date: String,
    mean_temperature: String,
}

#[derive(Deserialize, Serialize)]
struct WeatherData {
    ip: String,
    lat: String,
    lon: String,
    city: String,
    region: String,
    country: String,
    temperature: f64,
    windspeed: f64,
    weathercode: i32,
    week_weather_codes: Vec<i32>,
    week_max_temperatures: Vec<f64>,
    week_min_temperatures: Vec<f64>,
    weather_history: Vec<WeatherHistory>,
    errors: Vec<String>,
}

#[get("/weather")]
async fn get_weather() -> impl Responder {
    let client = reqwest::Client::new();

    // Fetch user's IP info
    let ip_info_response = client
        .get(IPINFO_URL)
        .send()
        .await
        .unwrap()
        .json::<IpInfo>()
        .await
        .unwrap();

    let location: Vec<&str> = ip_info_response.loc.split(',').collect();
    let lat = location[0];
    let lon = location[1];

    // Fetch current weather and 7-day forecast
    let current_weather_url = format!(
        "{}?latitude={}&longitude={}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto",
        OPEN_METEO_CURRENT_URL, lat, lon
    );

    let current_weather_response = client
        .get(&current_weather_url)
        .send()
        .await
        .unwrap()
        .json::<serde_json::Value>()
        .await
        .unwrap();

    let current_weather = current_weather_response["current_weather"].clone();
    let forecast = current_weather_response["daily"].clone();

    // Get today's date
    let today = Utc::now();
    let current_year = today.year();
    let month = today.month();
    let day = today.day();

    let mut weather_history = Vec::new();
    let mut error_log = Vec::new();

    // Fetch historical weather data
    for year in (1940 + ((current_year - 1) % 10)..=current_year - 1).step_by(5) {
        let date = format!("{}-{:02}-{:02}", year, month, day);

        let historical_url = format!(
            "{}?latitude={}&longitude={}&start_date={}&end_date={}&daily=temperature_2m_mean",
            OPEN_METEO_HISTORICAL_URL, lat, lon, date, date
        );

        match client.get(&historical_url).send().await {
            Ok(response) => {
                if let Ok(historical_response) = response.json::<serde_json::Value>().await {
                    let temperature_mean = historical_response["daily"]["temperature_2m_mean"]
                        .get(0)
                        .unwrap_or(&serde_json::Value::String("N/A".to_string()))
                        .to_string();

                    weather_history.push(WeatherHistory {
                        year,
                        date: date.clone(),
                        mean_temperature: temperature_mean,
                    });
                }
            }
            Err(err) => {
                error_log.push(format!(
                    "Error fetching historical data for {}: {}",
                    year, err
                ));
            }
        }
    }

    HttpResponse::Ok().json(WeatherData {
        ip: ip_info_response.ip,
        lat: lat.to_string(),
        lon: lon.to_string(),
        city: ip_info_response.city,
        region: ip_info_response.region,
        country: ip_info_response.country,
        temperature: current_weather["temperature"].as_f64().unwrap_or(0.0),
        windspeed: current_weather["windspeed"].as_f64().unwrap_or(0.0),
        weathercode: current_weather["weathercode"].as_i64().unwrap_or(0) as i32,
        week_weather_codes: forecast["weathercode"]
            .as_array()
            .unwrap()
            .iter()
            .map(|code| code.as_i64().unwrap_or(0) as i32)
            .collect(),
        week_max_temperatures: forecast["temperature_2m_max"]
            .as_array()
            .unwrap()
            .iter()
            .map(|temp| temp.as_f64().unwrap_or(0.0))
            .collect(),
        week_min_temperatures: forecast["temperature_2m_min"]
            .as_array()
            .unwrap()
            .iter()
            .map(|temp| temp.as_f64().unwrap_or(0.0))
            .collect(),
        weather_history,
        errors: error_log,
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(get_weather))
        .bind(("127.0.0.1", 5000))?
        .run()
        .await
}
