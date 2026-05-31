import { AppError } from './errors.js';

export function errorHandler(err, c) {
  if (err instanceof AppError) {
    return c.json({ error: err.message }, err.statusCode);
  }
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
}

export function corsMiddleware(c, next) {
  c.res.headers.set('Access-Control-Allow-Origin', '*');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  return next();
}

export function jsonMiddleware(c, next) {
  c.res.headers.set('Content-Type', 'application/json');
  return next();
}
