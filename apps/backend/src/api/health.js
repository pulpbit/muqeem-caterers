import { getDB } from '../db/index.js';
import { AppError } from '../core/errors.js';

/**
 * GET /api/health
 * Returns service health status and DB connectivity.
 */
export async function handleHealth(c) {
  let dbStatus = 'unknown';
  try {
    const db = getDB(c);
    await db.prepare('SELECT 1').run();
    dbStatus = 'ok';
  } catch (err) {
    dbStatus = 'error';
    console.error('Health check DB error:', err.message);
  }

  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
}
