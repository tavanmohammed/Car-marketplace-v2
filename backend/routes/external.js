// routes/external.js
import express from "express";
import axios from "axios";
import pool from "../db.js";

const router = express.Router();

/**
 * GET /api/external/models/:brand
 * Example: /api/external/models/Toyota
 */
router.get("/models/:brand", async (req, res, next) => {
  try {
    const brand = req.params.brand;

    // TODO: Replace with a real external car model API
    // Example dummy URL (placeholder for now)
    const url = `https://example-car-api.com/models?brand=${encodeURIComponent(
      brand
    )}`;

    const response = await axios.get(url);

    // Assume response.data looks like: { models: ["Corolla", "Camry", "Yaris"] }
    const apiData = response.data;
    const models = apiData.models || [];

    // Convert list to simple text to store in DB
    const modelsText = models.join(", ");

    // Save into car_model_logs table
    await pool.query(
      "INSERT INTO car_model_logs (brand, models_text) VALUES (?, ?)",
      [brand, modelsText]
    );

    // Return to frontend
    res.json({
      brand,
      models,
      source: "external car models API",
    });
  } catch (err) {
    console.error("Error in car models external API:", err.message || err);
    next(err);
  }
});

export default router;
