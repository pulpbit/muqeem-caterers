import { Hono } from 'hono';
import { errorHandler, corsMiddleware } from './core/middleware.js';
import { handleHealth } from './api/health.js';
import { handleLogin, handleLogout, handleMe } from './api/auth.js';
import {
  listCategories, createCategory, updateCategory, deleteCategory,
  listItems, createItem, updateItem, deleteItem, toggleItem
} from './api/menu.js';
import {
  listEvents, listAllEvents, getEvent, createEvent, updateEvent,
  updateEventStatus, deleteEvent
} from './api/events.js';
import { handlePublicInquiry } from './api/public.js';
import {
  getQuotationByEvent, getQuotation, createQuotation,
  updateQuotation, updateQuotationStatus, deleteQuotation
} from './api/quotations.js';
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

// Events
app.get('/api/events', listEvents);
app.get('/api/events/all', listAllEvents);
app.get('/api/events/:id', getEvent);
app.post('/api/events', createEvent);
app.put('/api/events/:id', updateEvent);
app.patch('/api/events/:id/status', updateEventStatus);
app.delete('/api/events/:id', requireAuth, deleteEvent);

// Public
app.post('/api/public/inquiry', handlePublicInquiry);

// Quotations
app.get('/api/quotations/event/:eventId', getQuotationByEvent);
app.get('/api/quotations/:id', getQuotation);
app.post('/api/quotations', requireAuth, createQuotation);
app.put('/api/quotations/:id', requireAuth, updateQuotation);
app.patch('/api/quotations/:id/status', requireAuth, updateQuotationStatus);
app.delete('/api/quotations/:id', requireAuth, deleteQuotation);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
