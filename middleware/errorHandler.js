const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  // Default
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }
  
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  if (err.isJoi) {
    statusCode = 400;
    message = err.details.map((d) => d.message).join(", ");
  }
  
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired";
  }

  return res.status(statusCode).json({
    status: "error",
    message,
  });
};

export default errorHandler;
