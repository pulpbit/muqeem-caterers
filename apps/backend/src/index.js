import { Hono } from 'hono';
import { errorHandler, corsMiddleware } from './core/middleware.js';
import { handleHealth } from './api/health.js';
import { handleLogin, handleLogout, handleMe } from './api/auth.js';

const app = new Hono();

app.use('*', corsMiddleware);
app.onError(errorHandler);

app.get('/api/health', handleHealth);

app.post('/api/auth/login', handleLogin);
app.post('/api/auth/logout', handleLogout);
app.get('/api/auth/me', handleMe);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
