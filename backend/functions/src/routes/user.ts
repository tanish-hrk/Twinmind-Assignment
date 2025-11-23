// User API routes

import { Router } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { query } from '../../shared/database.js';

const router = Router();

// Get user settings
router.get('/settings', async (req: AuthRequest, res) => {
  const userId = req.userId!;

  const result = await query('SELECT * FROM user_settings WHERE user_id = $1', [userId]);

  res.json({
    success: true,
    data: result.rows[0] || {},
    timestamp: new Date().toISOString(),
  });
});

// Update user settings
router.patch('/settings', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const updates = req.body;

  const result = await query(
    `INSERT INTO user_settings (user_id, data_retention_days, ai_insights_enabled, notifications_enabled)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       data_retention_days = COALESCE($2, user_settings.data_retention_days),
       ai_insights_enabled = COALESCE($3, user_settings.ai_insights_enabled),
       notifications_enabled = COALESCE($4, user_settings.notifications_enabled),
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [userId, updates.dataRetentionDays, updates.aiInsightsEnabled, updates.notificationsEnabled]
  );

  res.json({
    success: true,
    data: result.rows[0],
    timestamp: new Date().toISOString(),
  });
});

export default router;
