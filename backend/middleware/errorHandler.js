/**
 * Global Express Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Express Global Error:', err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.name || 'ServerError',
    message: err.message || 'An unexpected internal server error occurred',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
