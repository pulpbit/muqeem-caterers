import { getDB } from '../db/index.js';

/**
 * Find a user by their login identifier (email/username).
 * @param {import('hono').Context} c
 * @param {string} username
 * @returns {Promise<object|null>}
 */
export async function findByUsername(c, username) {
  const db = getDB(c);
  const result = await db
    .prepare('SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?')
    .bind(username)
    .first();
  return result || null;
}

/**
 * Find a user by ID.
 * @param {import('hono').Context} c
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function findById(c, id) {
  const db = getDB(c);
  const result = await db
    .prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?')
    .bind(id)
    .first();
  return result || null;
}
