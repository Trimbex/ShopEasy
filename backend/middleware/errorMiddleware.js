import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const errorHandler = (err, req, res, next) => {
  // Log error stack for development
  console.error('Error:', err.stack);

  // Handle Prisma-specific errors
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2025':
        return res.status(404).json({
          message: 'Record not found',
          stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
      case 'P2002':
        return res.status(409).json({
          message: 'A record with this value already exists',
          stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
      case 'P2014':
        return res.status(400).json({
          message: 'Invalid ID provided',
          stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
      default:
        return res.status(500).json({
          message: 'Database error occurred',
          stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
    }
  }

  // Determine status code and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server Error';

  // Send error response
  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

export default errorHandler; 