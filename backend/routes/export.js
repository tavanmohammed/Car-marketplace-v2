import express from "express";
import pool from "../db.js";
import { createObjectCsvStringifier } from "csv-writer";
import { requireLogin } from "../middleware/authRoles.js";

const router = express.Router();

router.get("/listings/csv", requireLogin, async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        listing_id,
        make,
        model,
        year,
        price,
        mileage,
        body_type,
        status,
        description
      FROM listings
      ORDER BY listing_id DESC
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No listings found" });
    }

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "listing_id", title: "ID" },
        { id: "make", title: "Make" },
        { id: "model", title: "Model" },
        { id: "year", title: "Year" },
        { id: "price", title: "Price" },
        { id: "mileage", title: "Mileage" },
        { id: "body_type", title: "Body Type" },
        { id: "status", title: "Status" },
        { id: "description", title: "Description" },
      ],
    });

    const header = csvStringifier.getHeaderString();
    const body = csvStringifier.stringifyRecords(rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=listings.csv");
    res.send(header + body);
  } catch (err) {
    next(err);
  }
});

export default router;
