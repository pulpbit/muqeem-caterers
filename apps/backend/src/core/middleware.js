const ALLOWED_ORIGINS = [
  'https://muqeem-caterers.pages.dev',
  'http://localhost:8787',
  'http://localhost:3000',
  'http://127.0.0.1:8787',
  'http://127.0.0.1:3000'
];

/**
 * Global error handler middleware.
 */
export function errorHandler(err, c) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (statusCode === 500) {
    console.error('Unhandled error:', err);
  }

  return c.json({ error: message }, statusCode);
}

/**
 * CORS middleware with credential support.
 * Sets the Access-Control-Allow-Origin to the request origin if allowed.
 */
export async function corsMiddleware(c, next) {
  const origin = c.req.header('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin === '';
  const corsOrigin = isAllowed && origin ? origin : (origin ? origin : '*');

  c.header('Access-Control-Allow-Origin', corsOrigin);
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Vary', 'Origin');

  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
}
