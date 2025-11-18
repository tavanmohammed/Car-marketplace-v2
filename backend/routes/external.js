import express from "express";
import axios from "axios";
import pool from "../db.js";
import { optionalAuth } from "../middleware/authRoles.js";

const router = express.Router();

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
    next(err);
  }
});

export default router;
