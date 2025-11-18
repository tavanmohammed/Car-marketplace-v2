import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/listings-by-brand", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT brand, COUNT(*) AS count
       FROM listings
       GROUP BY brand
       ORDER BY count DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
