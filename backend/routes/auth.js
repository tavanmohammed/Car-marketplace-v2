import express from "express";
import pool from "../db.js";
import Joi from "joi";

const router = express.Router();

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().min(1).max(100).required(),
  last_name: Joi.string().min(1).max(100).required(),
  phone_number: Joi.string().min(10).max(20).required(),
});

router.post("/register", async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((d) => d.message),
      });
    }

    const { username, email, password, first_name, last_name, phone_number } = value;

    const [existing] = await pool.query(
      "SELECT user_id FROM users WHERE email = ? OR username = ?",
      [email, username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const plainPassword = password;

    const [result] = await pool.query(
      `
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone_number, role)
      VALUES (?, ?, ?, ?, ?, ?, 'user')
      `,
      [username, email, plainPassword, first_name, last_name, phone_number]
    );

    const user = {
      id: result.insertId,
      username,
      email,
      first_name,
      last_name,
      phone_number,
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

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).required(),
});

router.post("/login", async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Invalid login data" });
    }

    const { email, password } = value;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const userRow = rows[0];

    const match = password === userRow.password_hash;
    if (!match) {
      return res.status(401).json({ message: "Incorrect password" });
    }

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

router.get("/me", (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

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
