import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "car_marketplace",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
};

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then((connection) => {
    console.log("✅ Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    console.error("Please check:");
    console.error("  1. MySQL server is running");
    console.error("  2. Database exists:", dbConfig.database);
    console.error("  3. User credentials in .env file");
    console.error("  4. Password is correct (can be empty if no password set)");
  });

export default pool;
