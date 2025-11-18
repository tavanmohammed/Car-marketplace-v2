import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import listingsRoutes from "./routes/listings.js";
import messagesRoutes from "./routes/messages.js";
import exportRoutes from "./routes/export.js";
import externalRoutes from "./routes/external.js";
import webservicesRoutes from "./routes/webservices.js";
import statsRoutes from "./routes/stats.js";
import viewsRoutes from "./routes/views.js";
import {
  handleDatabaseError,
  handleValidationError,
  handleExternalAPIError,
  handleGenericError,
  handleNotFound,
} from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true);
      }
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.get("/api/health", async (req, res) => {
  try {
    const pool = (await import("./db.js")).default;
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM listings");
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "iWantCar API",
      database: "connected",
      listingsCount: rows[0]?.count || 0
    });
  } catch (err) {
    res.status(500).json({ 
      status: "error", 
      message: "Database connection failed",
      error: err.message 
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/listings", listingsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/external", externalRoutes);
app.use("/api/webservices", webservicesRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/views", viewsRoutes);

app.use(handleValidationError);
app.use(handleExternalAPIError);
app.use(handleDatabaseError);
app.use("/api", handleNotFound);
app.use(handleGenericError);

app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || "development"}`);
});
