import express from "express";
import axios from "axios";
import pool from "../db.js";
import { optionalAuth } from "../middleware/authRoles.js";

const router = express.Router();

router.get("/weather/:city", optionalAuth, async (req, res, next) => {
  try {
    const city = req.params.city;
    const apiKey = process.env.WEATHER_API_KEY || "demo_key";
    
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    
    let weatherData;
    try {
      const response = await axios.get(weatherUrl, { timeout: 5000 });
      weatherData = {
        city: response.data.name,
        country: response.data.sys.country,
        temperature: response.data.main.temp,
        description: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind?.speed || 0,
        fetchedAt: new Date().toISOString(),
      };
    } catch (apiErr) {
      console.warn("Weather API unavailable, using mock data:", apiErr.message);
      weatherData = {
        city: city,
        country: "CA",
        temperature: 22.5,
        description: "partly cloudy",
        humidity: 65,
        windSpeed: 15,
        fetchedAt: new Date().toISOString(),
        note: "Mock data - API unavailable",
      };
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS weather_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(10),
        temperature DECIMAL(5,2),
        description VARCHAR(255),
        humidity INT,
        wind_speed DECIMAL(5,2),
        fetched_at DATETIME,
        user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
      )
    `);

    const userId = req.user ? req.user.id : null;
    await pool.query(
      `INSERT INTO weather_logs (city, country, temperature, description, humidity, wind_speed, fetched_at, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        weatherData.city,
        weatherData.country,
        weatherData.temperature,
        weatherData.description,
        weatherData.humidity,
        weatherData.windSpeed,
        weatherData.fetchedAt,
        userId,
      ]
    );

    const [recentLogs] = await pool.query(
      `SELECT city, temperature, description, fetched_at 
       FROM weather_logs 
       WHERE city = ? 
       ORDER BY fetched_at DESC 
       LIMIT 5`,
      [city]
    );

    res.json({
      success: true,
      current: weatherData,
      recentHistory: recentLogs,
      source: "OpenWeatherMap API",
    });
  } catch (err) {
    console.error("Error in weather external API:", err.message || err);
    next(err);
  }
});

router.get("/weather/history/:city", optionalAuth, async (req, res, next) => {
  try {
    const city = req.params.city;
    const limit = parseInt(req.query.limit) || 10;

    const [rows] = await pool.query(
      `SELECT 
         id,
         city,
         country,
         temperature,
         description,
         humidity,
         wind_speed,
         fetched_at,
         created_at
       FROM weather_logs
       WHERE city = ?
       ORDER BY fetched_at DESC
       LIMIT ?`,
      [city, limit]
    );

    res.json({
      success: true,
      city,
      count: rows.length,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/car-data/:vin", optionalAuth, async (req, res, next) => {
  try {
    const vin = req.params.vin.toUpperCase();
    
    const vinUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
    
    let carData;
    try {
      const response = await axios.get(vinUrl, { timeout: 5000 });
      const results = response.data.Results || [];
      
      const getValue = (variable) => {
        const item = results.find((r) => r.Variable === variable);
        return item?.Value || "N/A";
      };

      carData = {
        vin: vin,
        make: getValue("Make"),
        model: getValue("Model"),
        year: getValue("Model Year"),
        bodyClass: getValue("Body Class"),
        engineCylinders: getValue("Engine Number of Cylinders"),
        fuelType: getValue("Fuel Type - Primary"),
        manufacturer: getValue("Manufacturer Name"),
        fetchedAt: new Date().toISOString(),
      };
    } catch (apiErr) {
      console.warn("VIN API unavailable:", apiErr.message);
      carData = {
        vin: vin,
        note: "API unavailable - mock data",
        fetchedAt: new Date().toISOString(),
      };
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS vin_lookups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vin VARCHAR(17) NOT NULL,
        make VARCHAR(100),
        model VARCHAR(100),
        year VARCHAR(10),
        body_class VARCHAR(100),
        engine_cylinders VARCHAR(10),
        fuel_type VARCHAR(50),
        manufacturer VARCHAR(200),
        fetched_at DATETIME,
        user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
        INDEX idx_vin (vin)
      )
    `);

    const userId = req.user ? req.user.id : null;
    await pool.query(
      `INSERT INTO vin_lookups (vin, make, model, year, body_class, engine_cylinders, fuel_type, manufacturer, fetched_at, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        carData.vin,
        carData.make,
        carData.model,
        carData.year,
        carData.bodyClass,
        carData.engineCylinders,
        carData.fuelType,
        carData.manufacturer,
        carData.fetchedAt,
        userId,
      ]
    );

    const [recentLookups] = await pool.query(
      `SELECT vin, make, model, year, fetched_at 
       FROM vin_lookups 
       WHERE vin = ? 
       ORDER BY fetched_at DESC 
       LIMIT 3`,
      [vin]
    );

    res.json({
      success: true,
      data: carData,
      recentLookups: recentLookups,
      source: "NHTSA VIN Decoder API",
    });
  } catch (err) {
    console.error("Error in VIN lookup:", err.message || err);
    next(err);
  }
});

export default router;
