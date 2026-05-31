import { Hono } from 'hono';
import { errorHandler, corsMiddleware } from './core/middleware.js';
import { handleHealth } from './api/health.js';

const app = new Hono();

app.use('*', corsMiddleware);
app.onError(errorHandler);

app.get('/api/health', handleHealth);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
