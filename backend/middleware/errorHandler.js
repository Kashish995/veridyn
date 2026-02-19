const errorHandler = (err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    data: null,
    error: err.name || "SERVER_ERROR"
  });
};

export default errorHandler;
