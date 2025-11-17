// routes/views.js
import express from "express";
import pool from "../db.js";

const router = express.Router();

// Example: GET /api/views/top-sellers
router.get("/top-sellers", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM view_top_sellers");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Example: GET /api/views/avg-price-by-brand
router.get("/avg-price-by-brand", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM view_avg_price_by_brand");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Add similar routes for all your Phase II views

export default router;
