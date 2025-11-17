// backend/routes/auth.js
import express from "express";
import pool from "../db.js";
import Joi from "joi";

const router = express.Router();

/**
 * REGISTER
 * POST /api/auth/register
 * Expects body: { name, email, password }
 */

// Validation schema for registration
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),   // matches frontend "name"
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
});

router.post("/register", async (req, res, next) => {
  try {
    // 1) Validate input
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    const { name, email, password } = value;

    // 2) Check if email or username already exists
    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE email = ? OR username = ?",
      [email, name]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // 🔴 For this project, store password as plain text in password_hash
    const plainPassword = password;

    // 3) Insert user (username = name)
    const [result] = await pool.query(
      `
      INSERT INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, 'user')
      `,
      [name, email, plainPassword]
    );

    // 4) Optionally log them in right away
    const user = {
      id: result.insertId,
      username: name,
      email,
      role: "user",
    };

    if (req.session) {
      req.session.user = user;
    }

    res.status(201).json({
      message: "User registered",
      user,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * LOGIN
 * POST /api/auth/login
 * Expects body: { email, password }
 */

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
});

router.post("/login", async (req, res, next) => {
  try {
    // 1) Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Invalid login data" });
    }

    const { email, password } = value;

    // 2) Lookup user by email
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRow = rows[0];

    // 3) Compare plain text password with stored password_hash
    const match = password === userRow.password_hash;
    if (!match) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // 4) Save user session
    const user = {
      id: userRow.user_id,
      username: userRow.username,
      email: userRow.email,
      role: userRow.role,
    };

    if (req.session) {
      req.session.user = user;
    }

    res.json({ message: "Login successful", user });
  } catch (err) {
    next(err);
  }
});

/**
 * LOGOUT
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  } else {
    res.json({ message: "No active session" });
  }
});

export default router;
