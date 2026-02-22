const errorHandler = (err, req, res, next) => {
  console.error("Global Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    data: null,
    error: err.stack || null
  });
};

export default errorHandler;