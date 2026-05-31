/**
 * Get D1 database binding from the request context.
 * @param {import('hono').Context} c - Hono context
 * @returns {import('hono').D1Database}
 */
export function getDB(c) {
  const db = c.env.DB;
  if (!db) {
    throw new Error('D1 database binding (DB) not found in environment');
  }
  return db;
}
