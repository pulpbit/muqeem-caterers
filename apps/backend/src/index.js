import { Hono } from 'hono';
import { errorHandler, corsMiddleware } from './core/middleware.js';
import { handleHealth } from './api/health.js';
import { handleLogin, handleLogout, handleMe } from './api/auth.js';
import {
  listCategories, createCategory, updateCategory, deleteCategory,
  listItems, createItem, updateItem, deleteItem, toggleItem
} from './api/menu.js';
import { requireAuth } from './core/middleware.js';

const app = new Hono();

app.use('*', corsMiddleware);
app.onError(errorHandler);

app.get('/api/health', handleHealth);

app.post('/api/auth/login', handleLogin);
app.post('/api/auth/logout', handleLogout);
app.get('/api/auth/me', handleMe);

// Menu Categories
app.get('/api/menu/categories', listCategories);
app.post('/api/menu/categories', requireAuth, createCategory);
app.put('/api/menu/categories/:id', requireAuth, updateCategory);
app.delete('/api/menu/categories/:id', requireAuth, deleteCategory);

// Menu Items
app.get('/api/menu/items', listItems);
app.post('/api/menu/items', requireAuth, createItem);
app.put('/api/menu/items/:id', requireAuth, updateItem);
app.delete('/api/menu/items/:id', requireAuth, deleteItem);
app.patch('/api/menu/items/:id/toggle', requireAuth, toggleItem);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
