import { api } from './api.js';
import { authState } from '../utils/authState.js';

/**
 * Login with username and password.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<object>} user object
 */
export async function login(username, password) {
  const data = await api.post('/auth/login', { username, password });
  authState.setUser(data.user);
  return data.user;
}

/**
 * Check current session and restore auth state.
 * @returns {Promise<object|null>} user or null
 */
export async function checkSession() {
  try {
    const data = await api.get('/auth/me');
    authState.setUser(data.user);
    return data.user;
  } catch {
    authState.clear();
    return null;
  }
}

/**
 * Logout the current user.
 */
export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // ignore
  }
  authState.clear();
}
