// Error handling middleware

import type { Request, Response, NextFunction } from 'express';
import { config } from '../../shared/config.js';
import type { ApiError } from '../../shared/types.js';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  const details = err instanceof AppError ? err.details : undefined;

  const error: ApiError = {
    code,
    message: err.message,
    details,
  };

  // Don't expose internal errors in production
  if (config.nodeEnv === 'production' && statusCode === 500) {
    error.message = 'An internal server error occurred';
    delete error.details;
  }

  res.status(statusCode).json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
  });
}
