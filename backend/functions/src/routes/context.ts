// Context API routes

import { Router } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { query } from '../../shared/database.js';
import { AppError } from '../middleware/error-handler.js';
import type { CapturedContext, CreateContextRequest } from '../../shared/types.js';

const router = Router();

// Create new context
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const body: CreateContextRequest = req.body;

    const result = await query<CapturedContext>(
      `INSERT INTO captured_contexts (user_id, type, timestamp, url, title, domain)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        body.type,
        new Date(),
        body.metadata.url,
        body.metadata.title,
        body.metadata.url ? new URL(body.metadata.url).hostname : null,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw new AppError('Failed to create context', 500, 'CREATE_CONTEXT_ERROR');
  }
});

// Get contexts for user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { page = 1, pageSize = 50, type } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);

    let queryText = `
      SELECT * FROM captured_contexts
      WHERE user_id = $1
    `;
    const params: unknown[] = [userId];

    if (type) {
      queryText += ` AND type = $2`;
      params.push(type);
    }

    queryText += ` ORDER BY timestamp DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(pageSize), offset);

    const result = await query<CapturedContext>(queryText, params);

    res.json({
      success: true,
      data: {
        items: result.rows,
        page: Number(page),
        pageSize: Number(pageSize),
        hasMore: result.rows.length === Number(pageSize),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    throw new AppError('Failed to fetch contexts', 500, 'FETCH_CONTEXTS_ERROR');
  }
});

// Delete context
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const result = await query('DELETE FROM captured_contexts WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ]);

    if (result.rowCount === 0) {
      throw new AppError('Context not found', 404, 'CONTEXT_NOT_FOUND');
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to delete context', 500, 'DELETE_CONTEXT_ERROR');
  }
});

export default router;
