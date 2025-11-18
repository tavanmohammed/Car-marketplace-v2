export function handleDatabaseError(err, req, res, next) {
  if (err.code === "ECONNREFUSED") {
    console.error("Database connection refused:", err.message);
    return res.status(503).json({
      success: false,
      message: "Database connection failed",
      error: "Cannot connect to MySQL server. Please check if MySQL is running.",
      details: "Make sure MySQL server is started and running on localhost",
    });
  }

  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Database connection lost:", err.message);
    return res.status(503).json({
      success: false,
      message: "Database connection lost",
      error: "Connection to database was lost. Please try again.",
    });
  }

  if (err.code === "ER_ACCESS_DENIED_ERROR") {
    console.error("Database access denied:", err.message);
    return res.status(503).json({
      success: false,
      message: "Database access denied",
      error: "Invalid database credentials. Please check your .env file.",
      details: "Verify DB_USER and DB_PASSWORD in backend/.env",
    });
  }

  if (err.code === "ER_BAD_DB_ERROR") {
    console.error("Database not found:", err.message);
    return res.status(503).json({
      success: false,
      message: "Database not found",
      error: `Database '${err.sqlMessage?.split("'")[1] || "unknown"}' does not exist.`,
      details: "Please create the database in MySQL Workbench first.",
    });
  }

  if (err.code === "ER_NO_SUCH_TABLE") {
    console.error("Database table error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Database table not found",
      error: err.message || "Required table does not exist in the database.",
      details: "Please run your SQL files to create the tables.",
    });
  }

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry",
      error: "This record already exists in the database.",
    });
  }

  if (err.code && err.code.startsWith("ER_")) {
    console.error("MySQL error:", err.code, err.message);
    return res.status(400).json({
      success: false,
      message: "Database error",
      error: err.message || "Invalid database operation.",
      code: err.code,
    });
  }

  if (err.sqlMessage) {
    console.error("SQL error:", err.sqlMessage);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: err.sqlMessage || "An error occurred while executing the database query.",
    });
  }

  next(err);
}

export function handleValidationError(err, req, res, next) {
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      })),
    });
  }

  next(err);
}

export function handleExternalAPIError(err, req, res, next) {
  if (err.response) {
    console.error("External API error:", err.response.status, err.response.data);
    return res.status(502).json({
      success: false,
      message: "External API error",
      error: "Failed to fetch data from external service.",
      details: err.response.status === 404 ? "Resource not found" : "Service unavailable",
    });
  }

  if (err.request) {
    console.error("External API timeout:", err.message);
    return res.status(504).json({
      success: false,
      message: "External API timeout",
      error: "External service did not respond in time.",
    });
  }

  next(err);
}

export function handleGenericError(err, req, res, next) {
  console.error("Unhandled error:", err);

  const isDevelopment = process.env.NODE_ENV !== "production";

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(isDevelopment && { stack: err.stack }),
  });
}

export function handleNotFound(req, res) {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: `The requested endpoint ${req.method} ${req.path} does not exist.`,
  });
}
