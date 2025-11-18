import express from "express";
import pool from "../db.js";
import { createObjectCsvStringifier } from "csv-writer";
import PDFDocument from "pdfkit";
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

router.get("/listings/pdf", requireLogin, async (req, res, next) => {
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

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=listings.pdf");

    doc.pipe(res);

    doc.fontSize(20).text("Car Listings Report", { align: "center", underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.fontSize(10).text(`Total Listings: ${rows.length}`, { align: "center" });
    doc.moveDown(2);

    rows.forEach((row, index) => {
      if (index > 0) {
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
      }

      doc.fontSize(14).text(`Listing #${row.listing_id}`, { underline: true });
      doc.fontSize(12);
      doc.text(`Make: ${row.make || "N/A"}`);
      doc.text(`Model: ${row.model || "N/A"}`);
      doc.text(`Year: ${row.year || "N/A"}`);
      doc.text(`Price: $${row.price || 0}`);
      doc.text(`Mileage: ${row.mileage || 0} km`);
      doc.text(`Body Type: ${row.body_type || "N/A"}`);
      doc.text(`Status: ${row.status || "N/A"}`);
      if (row.description) {
        doc.text(`Description: ${row.description.substring(0, 100)}${row.description.length > 100 ? "..." : ""}`);
      }
    });

    doc.end();
  } catch (err) {
    next(err);
  }
});

router.get("/messages/csv", requireLogin, async (req, res, next) => {
  try {
    const userId = req.session.user.id;
    const isAdmin = req.session.user.role === "admin";

    let query, params;
    if (isAdmin) {
      query = `
        SELECT 
          m.id,
          m.sender_id,
          m.receiver_id,
          m.message_text,
          m.sent_at,
          u1.username AS sender_name,
          u2.username AS receiver_name
        FROM messages m
        LEFT JOIN users u1 ON m.sender_id = u1.user_id
        LEFT JOIN users u2 ON m.receiver_id = u2.user_id
        ORDER BY m.sent_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT 
          m.id,
          m.sender_id,
          m.receiver_id,
          m.message_text,
          m.sent_at,
          u1.username AS sender_name,
          u2.username AS receiver_name
        FROM messages m
        LEFT JOIN users u1 ON m.sender_id = u1.user_id
        LEFT JOIN users u2 ON m.receiver_id = u2.user_id
        WHERE m.sender_id = ? OR m.receiver_id = ?
        ORDER BY m.sent_at DESC
      `;
      params = [userId, userId];
    }

    const [rows] = await pool.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No messages found" });
    }

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "id", title: "ID" },
        { id: "sender_name", title: "Sender" },
        { id: "receiver_name", title: "Receiver" },
        { id: "message_text", title: "Message" },
        { id: "sent_at", title: "Sent At" },
      ],
    });

    const header = csvStringifier.getHeaderString();
    const body = csvStringifier.stringifyRecords(rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=messages.csv");
    res.send(header + body);
  } catch (err) {
    next(err);
  }
});

export default router;
