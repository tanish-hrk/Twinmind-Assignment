// Health check routes

import { Router } from 'express';
import { pool } from '../../shared/database.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'running',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'running',
      },
    });
  }
});

export default router;
