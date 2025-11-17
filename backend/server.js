// backend/server.js
import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";

import pool from "./db.js";          // ← your MySQL pool (must exist)
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ---------- MIDDLEWARE ----------
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    credentials: true,
  })
);

app.use(
  session({
    name: "car_market_sid",
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set true if using HTTPS in prod
      sameSite: "lax",
    },
  })
);

// ---------- ROUTES ----------

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// AUTH routes (register / login / logout)
app.use("/api/auth", authRoutes);

// LISTINGS – list all cars with optional filters
// GET /api/listings?brand=Toyota&body=Sedan&minPrice=5000&maxPrice=30000
app.get("/api/listings", async (req, res, next) => {
  try {
    const { brand, body, minPrice, maxPrice } = req.query;

    const conditions = [];
    const params = [];

    if (brand) {
      conditions.push("make = ?");
      params.push(brand);
    }
    if (body) {
      conditions.push("body_style = ?");
      params.push(body);
    }
    if (minPrice) {
      conditions.push("price >= ?");
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      conditions.push("price <= ?");
      params.push(Number(maxPrice));
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT 
        listing_id,
        year,
        make,
        model,
        trim,
        price,
        mileage_km,
        city,
        province,
        main_photo_url,
        seller_id
      FROM listings
      ${where}
      ORDER BY created_at DESC
      `,
      params
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// SINGLE LISTING – detail page
// GET /api/listings/:id
app.get("/api/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `
      SELECT 
        l.*,
        u.username AS seller_name,
        u.email    AS seller_email
      FROM listings l
      JOIN users u ON l.seller_id = u.user_id
      WHERE l.listing_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// TOP SELLERS – simple example (adjust table/columns to your schema)
app.get("/api/sellers/top", async (req, res, next) => {
  try {
    // Example using a seller_ratings table (change to match your DB)
    const [rows] = await pool.query(
      `
      SELECT 
        u.user_id,
        u.username,
        AVG(r.rating)   AS avg_rating,
        COUNT(r.rating) AS rating_count
      FROM seller_ratings r
      JOIN users u ON r.seller_id = u.user_id
      GROUP BY u.user_id, u.username
      HAVING rating_count >= 1
      ORDER BY avg_rating DESC, rating_count DESC
      LIMIT 10
      `
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ---------- ERROR HANDLERS ----------

// 404 for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: "Internal server error" });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

