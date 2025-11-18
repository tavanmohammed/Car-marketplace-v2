import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/listings-by-brand", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT make, COUNT(*) AS count
       FROM listings
       GROUP BY make
       ORDER BY count DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/price-ranges", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        CASE 
          WHEN price < 10000 THEN 'Under $10k'
          WHEN price >= 10000 AND price < 20000 THEN '$10k - $20k'
          WHEN price >= 20000 AND price < 30000 THEN '$20k - $30k'
          WHEN price >= 30000 AND price < 50000 THEN '$30k - $50k'
          WHEN price >= 50000 AND price < 75000 THEN '$50k - $75k'
          ELSE NULL
        END AS price_range,
        COUNT(*) AS count
       FROM listings
       WHERE status = 'available' AND price < 75000
       GROUP BY price_range
       ORDER BY 
         CASE 
           WHEN price_range = 'Under $10k' THEN 1
           WHEN price_range = '$10k - $20k' THEN 2
           WHEN price_range = '$20k - $30k' THEN 3
           WHEN price_range = '$30k - $50k' THEN 4
           WHEN price_range = '$50k - $75k' THEN 5
         END`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/car-prices", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        listing_id,
        year,
        price,
        make,
        model,
        mileage,
        CASE 
          WHEN year >= 1990 AND year < 2000 THEN '1990-2000'
          WHEN year >= 2000 AND year < 2010 THEN '2000-2010'
          WHEN year >= 2010 AND year < 2020 THEN '2010-2020'
          WHEN year >= 2020 THEN '2020-Present'
          ELSE 'Other'
        END AS year_range
       FROM listings
       WHERE status = 'available'
       ORDER BY year ASC, price ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
