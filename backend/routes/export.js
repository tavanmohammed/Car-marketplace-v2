// routes/export.js
import express from "express";
import pool from "../db.js";
import { createObjectCsvStringifier } from "csv-writer";
import PDFDocument from "pdfkit";
import { requireLogin } from "../middleware/authRoles.js"; // ✅ use requireLogin

const router = express.Router();

// GET /api/export/listings/csv
router.get("/listings/csv", requireLogin, async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM listings");

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "id", title: "ID" },
        { id: "title", title: "Title" },
        { id: "brand", title: "Brand" },
        { id: "model", title: "Model" },
        { id: "year", title: "Year" },
        { id: "price", title: "Price" },
        { id: "location", title: "Location" },
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

// GET /api/export/listings/pdf
router.get("/listings/pdf", requireLogin, async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM listings");

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=listings.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("Car Listings Report", { underline: true });
    doc.moveDown();

    rows.forEach((row) => {
      doc
        .fontSize(12)
        .text(
          `#${row.id} – ${row.brand} ${row.model} (${row.year}) - $${row.price} @ ${row.location}`
        );
    });

    doc.end();
  } catch (err) {
    next(err);
  }
});

export default router;

