export const errorHandler = (err, req, res, next) => {
  // Đảm bảo response chưa được gửi
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Lỗi validation Joi
  if (err.isJoi) {
    statusCode = 400;
    message = err.details.map(detail => detail.message).join(', ');
  }

  // Lỗi validation Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(error => error.message).join(', ');
  }

  // Lỗi trùng key Mongoose
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Lỗi cast Mongoose (ObjectId không hợp lệ)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Lỗi JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Ghi log lỗi trong môi trường development
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    console.error('Error Details:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      statusCode,
      url: req.url,
      method: req.method
    });
  }

  // Đảm bảo trả về JSON response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

