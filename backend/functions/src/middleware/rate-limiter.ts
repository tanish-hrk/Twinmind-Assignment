// Rate limiting middleware

import type { Request, Response, NextFunction } from 'express';
import { config } from '../../shared/config.js';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Simple in-memory rate limiter (use Redis in production)
export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const key = req.ip || 'unknown';
  const now = Date.now();

  // Initialize or get existing record
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.rateLimit.windowMs,
    };
    next();
    return;
  }

  // Increment count
  store[key].count++;

  // Check limit
  if (store[key].count > config.rateLimit.maxRequests) {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    });
    return;
  }

  next();
}
