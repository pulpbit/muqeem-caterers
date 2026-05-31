import { ValidationError } from '../core/errors.js';

/**
 * Validate login request body.
 * @param {{ username?: string, password?: string }} body
 * @returns {{ username: string, password: string }}
 * @throws {ValidationError}
 */
export function validateLogin(body) {
  const errors = [];

  if (!body || !body.username || typeof body.username !== 'string' || body.username.trim().length === 0) {
    errors.push('Username is required');
  }

  if (!body || !body.password || typeof body.password !== 'string' || body.password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }

  return {
    username: body.username.trim(),
    password: body.password
  };
}
