import { UnauthorizedError } from '../core/errors.js';
import * as userRepo from '../repositories/userRepository.js';
import * as sessionRepo from '../repositories/sessionRepository.js';

/**
 * Authenticate a user with username and password.
 * Password is compared as plain text (simple auth for initial phase).
 * @param {import('hono').Context} c
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ user: object, token: string }>}
 * @throws {UnauthorizedError}
 */
export async function login(c, username, password) {
  const user = await userRepo.findByUsername(c, username);

  if (!user || user.password_hash !== password) {
    throw new UnauthorizedError('Invalid username or password');
  }

  const token = await sessionRepo.createSession(c, user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
}

/**
 * Get the currently authenticated user from the session cookie.
 * @param {import('hono').Context} c
 * @returns {Promise<object>}
 * @throws {UnauthorizedError}
 */
export async function getCurrentUser(c) {
  const token = getSessionToken(c);
  if (!token) {
    throw new UnauthorizedError('Not authenticated');
  }

  const session = await sessionRepo.findSessionByToken(c, token);
  if (!session) {
    throw new UnauthorizedError('Session expired or invalid');
  }

  return {
    id: session.user_id,
    name: session.name,
    email: session.email,
    role: session.role
  };
}

/**
 * Logout by deleting the current session.
 * @param {import('hono').Context} c
 */
export async function logout(c) {
  const token = getSessionToken(c);
  if (token) {
    await sessionRepo.deleteSession(c, token);
  }
}

/**
 * Extract session token from request cookie.
 * @param {import('hono').Context} c
 * @returns {string|null}
 */
function getSessionToken(c) {
  const cookieHeader = c.req.header('Cookie') || '';
  const match = cookieHeader.match(/session=([^;]+)/);
  return match ? match[1] : null;
}
