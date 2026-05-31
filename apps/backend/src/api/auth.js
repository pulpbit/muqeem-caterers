import { validateLogin } from '../validators/authValidator.js';
import * as authService from '../services/authService.js';

/**
 * POST /api/auth/login
 * Authenticate user and set session cookie.
 */
export async function handleLogin(c) {
  const body = await c.req.json();
  const { username, password } = validateLogin(body);

  const { user, token } = await authService.login(c, username, password);

  c.header('Set-Cookie', `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`);

  return c.json({ user });
}

/**
 * POST /api/auth/logout
 * Clear session cookie and delete session.
 */
export async function handleLogout(c) {
  await authService.logout(c);

  c.header(
    'Set-Cookie',
    'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
  );

  return c.json({ message: 'Logged out successfully' });
}

/**
 * GET /api/auth/me
 * Return the currently authenticated user.
 */
export async function handleMe(c) {
  const user = await authService.getCurrentUser(c);
  return c.json({ user });
}
