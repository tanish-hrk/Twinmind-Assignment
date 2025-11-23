// Authentication middleware

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../shared/config.js';
import { AppError } from './error-handler.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid authorization header', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };
      (req as AuthRequest).userId = decoded.userId;
      next();
    } catch (error) {
      throw new AppError('Invalid or expired token', 401, 'UNAUTHORIZED');
    }
  } catch (error) {
    next(error);
  }
}
