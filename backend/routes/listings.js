// routes/listings.js
import express from "express";
import pool from "../db.js";
import { requireLogin } from "../middleware/authRoles.js";
import { validateBody } from "../middleware/validate.js";
import Joi from "joi";

const router = express.Router();

// Joi schema that matches YOUR listings table
const listingSchema = Joi.object({
  make: Joi.string().max(50).required(),
  model: Joi.string().max(50).required(),
  year: Joi.number()
    .integer()
    .min(1950)
    .max(new Date().getFullYear())
    .required(),
  price: Joi.number().positive().required(),
  mileage: Joi.number().integer().min(0).required(),
  body_type: Joi.string().max(50).required(),
  vin: Joi.string().allow("").optional(),
  description: Joi.string().allow("").optional(),
  status: Joi.string().valid("available", "sold", "pending").default("available"),
});

// ------------------------------------------------------
// XML endpoint (keep BEFORE /:id)
// GET /api/listings/xml/all
// ------------------------------------------------------
router.get("/xml/all", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         listing_id AS id,
         seller_id,
         make,
         model,
         year,
         price,
         mileage,
         body_type,
         status
       FROM listings`
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<listings>\n`;
    for (const row of rows) {
      xml += `  <listing id="${row.id}">\n`;
      xml += `    <seller_id>${row.seller_id}</seller_id>\n`;
      xml += `    <make>${row.make}</make>\n`;
      xml += `    <model>${row.model}</model>\n`;
      xml += `    <year>${row.year}</year>\n`;
      xml += `    <price>${row.price}</price>\n`;
      xml += `    <mileage>${row.mileage}</mileage>\n`;
      xml += `    <body_type>${row.body_type}</body_type>\n`;
      xml += `    <status>${row.status}</status>\n`;
      xml += `  </listing>\n`;
    }
    xml += `</listings>`;

    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------
// GET /api/listings  (list + filters)
// Frontend sends: brand, body, priceMin, priceMax, q
// ------------------------------------------------------
router.get("/", async (req, res, next) => {
  try {
    const { brand, body, priceMin, priceMax, q } = req.query;

    let sql = `SELECT 
                 listing_id AS id,
                 seller_id,
                 make,
                 model,
                 year,
                 price,
                 mileage,
                 body_type,
                 vin,
                 description,
                 status
               FROM listings
               WHERE 1=1`;
    const params = [];

    if (brand) {
      sql += " AND make = ?";
      params.push(brand);
    }

    if (body) {
      sql += " AND body_type = ?";
      params.push(body);
    }

    if (priceMin) {
      sql += " AND price >= ?";
      params.push(priceMin);
    }

    if (priceMax) {
      sql += " AND price <= ?";
      params.push(priceMax);
    }

    if (q) {
      sql += " AND (make LIKE ? OR model LIKE ? OR body_type LIKE ?)";
      const pattern = `%${q}%`;
      params.push(pattern, pattern, pattern);
    }

    // Simple version: return all rows (your hook can compute total)
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------
// GET /api/listings/:id  (single listing)
// ------------------------------------------------------
router.get("/:id", async (req, res, next) => {
  try {
    const listingId = req.params.id;

    const [rows] = await pool.query(
      `SELECT 
         listing_id AS id,
         seller_id,
         make,
         model,
         year,
         price,
         mileage,
         body_type,
         vin,
         description,
         status
       FROM listings
       WHERE listing_id = ?`,
      [listingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------
// POST /api/listings  (create listing)
// Requires login; seller_id = current user
// ------------------------------------------------------
router.post(
  "/",
  requireLogin,
  validateBody(listingSchema),
  async (req, res, next) => {
    try {
      const data = req.validatedBody;
      const sellerId = req.session.user.id; // users.user_id

      const [result] = await pool.query(
        `INSERT INTO listings
          (seller_id, make, model, year, price, mileage, body_type, vin, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sellerId,
          data.make,
          data.model,
          data.year,
          data.price,
          data.mileage,
          data.body_type,
          data.vin || "",
          data.description || "",
          data.status || "available",
        ]
      );

      res.status(201).json({
        message: "Listing created",
        id: result.insertId,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ------------------------------------------------------
// PUT /api/listings/:id  (update listing)
// Only owner OR admin may update
// ------------------------------------------------------
router.put(
  "/:id",
  requireLogin,
  validateBody(listingSchema),
  async (req, res, next) => {
    try {
      const listingId = req.params.id;
      const user = req.session.user;
      const data = req.validatedBody;

      const [rows] = await pool.query(
        "SELECT seller_id FROM listings WHERE listing_id = ?",
        [listingId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "Listing not found" });
      }

      const listing = rows[0];
      if (user.role !== "admin" && user.id !== listing.seller_id) {
        return res
          .status(403)
          .json({ message: "Not allowed to edit this listing" });
      }

      await pool.query(
        `UPDATE listings
         SET make = ?,
             model = ?,
             year = ?,
             price = ?,
             mileage = ?,
             body_type = ?,
             vin = ?,
             description = ?,
             status = ?
         WHERE listing_id = ?`,
        [
          data.make,
          data.model,
          data.year,
          data.price,
          data.mileage,
          data.body_type,
          data.vin || "",
          data.description || "",
          data.status || "available",
          listingId,
        ]
      );

      res.json({ message: "Listing updated" });
    } catch (err) {
      next(err);
    }
  }
);

// ------------------------------------------------------
// DELETE /api/listings/:id
// Only owner OR admin may delete
// ------------------------------------------------------
router.delete("/:id", requireLogin, async (req, res, next) => {
  try {
    const listingId = req.params.id;
    const user = req.session.user;

    const [rows] = await pool.query(
      "SELECT seller_id FROM listings WHERE listing_id = ?",
      [listingId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Listing not found" });
    }

    const listing = rows[0];
    if (user.role !== "admin" && user.id !== listing.seller_id) {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this listing" });
    }

    await pool.query("DELETE FROM listings WHERE listing_id = ?", [listingId]);
    res.json({ message: "Listing deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
