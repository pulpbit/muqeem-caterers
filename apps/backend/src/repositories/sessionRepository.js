import { getDB } from '../db/index.js';

const SESSION_TTL_HOURS = 24;

/**
 * Generate a random session token.
 * @returns {string}
 */
function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a new session for a user.
 * @param {import('hono').Context} c
 * @param {number} userId
 * @returns {Promise<string>} session token
 */
export async function createSession(c, userId) {
  const db = getDB(c);
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .replace('Z', '');

  await db
    .prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)')
    .bind(userId, token, expiresAt)
    .run();

  return token;
}

/**
 * Find a valid session by token.
 * Returns null if expired or not found.
 * @param {import('hono').Context} c
 * @param {string} token
 * @returns {Promise<object|null>} session with user info
 */
export async function findSessionByToken(c, token) {
  const db = getDB(c);
  const session = await db
    .prepare(`
      SELECT s.id, s.user_id, s.expires_at, u.name, u.email, u.role
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `)
    .bind(token)
    .first();

  return session || null;
}

/**
 * Delete a session by token.
 * @param {import('hono').Context} c
 * @param {string} token
 */
export async function deleteSession(c, token) {
  const db = getDB(c);
  await db
    .prepare('DELETE FROM sessions WHERE token = ?')
    .bind(token)
    .run();
}
