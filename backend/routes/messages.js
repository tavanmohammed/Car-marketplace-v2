import express from "express";
import pool from "../db.js";
import Joi from "joi";
import { requireLogin } from "../middleware/authRoles.js";
import { validateBody } from "../middleware/validate.js";
import { messageSchema } from "../schemas/messageSchema.js";

const router = express.Router();

router.post(
  "/send",
  requireLogin,
  validateBody(messageSchema),
  async (req, res, next) => {
    try {
      const sender_id = req.session.user.id;
      const { receiver_id, listing_id, message_text } = req.validatedBody;

      await pool.query(
        `INSERT INTO messages (sender_id, receiver_id, listing_id, message_text)
         VALUES (?, ?, ?, ?)`,
        [sender_id, receiver_id, listing_id || null, message_text]
      );

      res.status(201).json({ message: "Message sent" });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/inbox", requireLogin, async (req, res, next) => {
  try {
    const myId = req.session.user.id;

    const [rows] = await pool.query(
      `SELECT 
         m.id,
         m.sender_id,
         m.receiver_id,
         m.listing_id,
         m.message_text,
         m.sent_at
       FROM messages m
       WHERE m.receiver_id = ?
       ORDER BY m.sent_at DESC`,
      [myId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/sent", requireLogin, async (req, res, next) => {
  try {
    const myId = req.session.user.id;

    const [rows] = await pool.query(
      `SELECT 
         m.id,
         m.sender_id,
         m.receiver_id,
         m.listing_id,
         m.message_text,
         m.sent_at
       FROM messages m
       WHERE m.sender_id = ?
       ORDER BY m.sent_at DESC`,
      [myId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/thread/:otherUserId", requireLogin, async (req, res, next) => {
  try {
    const myId = req.session.user.id;
    const otherId = parseInt(req.params.otherUserId, 10);

    const [rows] = await pool.query(
      `SELECT 
         m.id,
         m.sender_id,
         m.receiver_id,
         m.listing_id,
         m.message_text,
         m.sent_at
       FROM messages m
       WHERE 
         (m.sender_id = ? AND m.receiver_id = ?)
         OR
         (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.sent_at ASC`,
      [myId, otherId, otherId, myId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.put(
  "/:id",
  requireLogin,
  validateBody(
    Joi.object({
      message_text: Joi.string().min(1).max(1000).required(),
    })
  ),
  async (req, res, next) => {
    try {
      const messageId = parseInt(req.params.id, 10);
      const userId = req.session.user.id;
      const { message_text } = req.validatedBody;

      const [rows] = await pool.query(
        "SELECT sender_id FROM messages WHERE id = ?",
        [messageId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Message not found" });
      }

      if (rows[0].sender_id !== userId && req.session.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Not allowed to update this message" });
      }

      await pool.query(
        "UPDATE messages SET message_text = ? WHERE id = ?",
        [message_text, messageId]
      );

      res.json({ message: "Message updated" });
    } catch (err) {
      next(err);
    }
  }
);

router.delete("/:id", requireLogin, async (req, res, next) => {
  try {
    const messageId = parseInt(req.params.id, 10);
    const userId = req.session.user.id;
    const isAdmin = req.session.user.role === "admin";

    const [rows] = await pool.query(
      "SELECT sender_id, receiver_id FROM messages WHERE id = ?",
      [messageId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    const message = rows[0];
    const canDelete =
      isAdmin ||
      message.sender_id === userId ||
      message.receiver_id === userId;

    if (!canDelete) {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this message" });
    }

    await pool.query("DELETE FROM messages WHERE id = ?", [messageId]);
    res.json({ message: "Message deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
