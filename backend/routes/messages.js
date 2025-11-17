// routes/messages.js
import express from "express";
import pool from "../db.js";
import { requireLogin } from "../middleware/authRoles.js";
import { validateBody } from "../middleware/validate.js";
import { messageSchema } from "../schemas/messageSchema.js";

const router = express.Router();

/**
 * POST /api/messages/send
 * Body (validated by Joi messageSchema):
 * {
 *   receiver_id: number,
 *   listing_id: number | null,
 *   message_text: string
 * }
 */
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

/**
 * GET /api/messages/inbox
 * All messages where I am the receiver
 */
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

/**
 * GET /api/messages/sent
 * All messages where I am the sender
 */
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

/**
 * GET /api/messages/thread/:otherUserId
 * Full conversation between me and someone else
 */
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

// 🔴 THIS LINE FIXES YOUR ERROR
export default router;
