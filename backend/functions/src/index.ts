// Main Express API server

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '../shared/config.js';
import { pool } from '../shared/database.js';

// Import routes
import contextRoutes from './routes/context.js';
import insightRoutes from './routes/insights.js';
import userRoutes from './routes/user.js';
import healthRoutes from './routes/health.js';

// Import middleware
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/logger.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import { authenticate } from './middleware/auth.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    credentials: true,
  })
);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter);

// Health check (no auth required)
app.use('/health', healthRoutes);

// API routes (require authentication)
app.use('/api/contexts', authenticate, contextRoutes);
app.use('/api/insights', authenticate, insightRoutes);
app.use('/api/user', authenticate, userRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'TwinMind API',
    version: '0.1.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(config.port, () => {
  console.log(`🚀 TwinMind API server listening on port ${config.port}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔐 CORS enabled for: ${config.cors.allowedOrigins.join(', ')}`);
});

process.on('SIGTERM', async () => {
  console.log('⏳ SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await pool.end();
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
