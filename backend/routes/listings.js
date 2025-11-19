import express from "express";
import pool from "../db.js";
import { requireLogin } from "../middleware/authRoles.js";
import { validateBody } from "../middleware/validate.js";
import Joi from "joi";

const router = express.Router();

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
  description: Joi.string().allow("").optional(),
  main_photo_url: Joi.string().allow("", null).optional(),
  status: Joi.string().valid("available", "sold", "pending").default("available"),
});

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

router.get("/", async (req, res, next) => {
  try {
    const { brand, body, priceMin, priceMax, q } = req.query;

    let sql = `SELECT 
                 listing_id,
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
                 main_photo_url,
                 status,
                 created_at
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

    const sortBy = req.query.sortBy || "newest";
    switch (sortBy) {
      case "price_high":
        sql += " ORDER BY price DESC";
        break;
      case "price_low":
        sql += " ORDER BY price ASC";
        break;
      case "newest":
      default:
        sql += " ORDER BY listing_id DESC";
        break;
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const listingId = req.params.id;

    const [rows] = await pool.query(
      `SELECT 
         listing_id,
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
         main_photo_url,
         status,
         created_at
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

router.post(
  "/",
  requireLogin,
  validateBody(listingSchema),
  async (req, res, next) => {
    try {
      const data = req.validatedBody;
      const sellerId = parseInt(req.session.user.id, 10);
      
      if (isNaN(sellerId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const [result] = await pool.query(
        `INSERT INTO listings
          (seller_id, make, model, year, price, mileage, body_type, description, main_photo_url, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sellerId,
          data.make,
          data.model,
          data.year,
          data.price,
          data.mileage,
          data.body_type,
          data.description || "",
          data.main_photo_url || null,
          data.status || "available",
        ]
      );

      res.status(201).json({
        message: "Listing created",
        id: result.insertId,
        listing_id: result.insertId,
      });
    } catch (err) {
      next(err);
    }
  }
);

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
