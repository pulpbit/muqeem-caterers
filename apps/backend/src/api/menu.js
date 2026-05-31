import { validateCategory, validateMenuItem } from '../validators/menuValidator.js';
import * as menuService from '../services/menuService.js';
import { requireAuth } from '../core/middleware.js';

// ─── Categories ───

export async function listCategories(c) {
  const categories = await menuService.getAllCategories(c);
  return c.json({ categories });
}

export async function createCategory(c) {
  const body = await c.req.json();
  const data = validateCategory(body);
  const category = await menuService.createCategory(c, data);
  return c.json({ category }, 201);
}

export async function updateCategory(c) {
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = validateCategory(body, true);
  const category = await menuService.updateCategory(c, id, data);
  return c.json({ category });
}

export async function deleteCategory(c) {
  const id = c.req.param('id');
  const result = await menuService.deleteCategory(c, id);
  return c.json(result);
}

// ─── Items ───

export async function listItems(c) {
  const items = await menuService.getAllItems(c, c.req.query());
  return c.json({ items });
}

export async function createItem(c) {
  const body = await c.req.json();
  const data = validateMenuItem(body);
  const item = await menuService.createItem(c, data);
  return c.json({ item }, 201);
}

export async function updateItem(c) {
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = validateMenuItem(body, true);
  const item = await menuService.updateItem(c, id, data);
  return c.json({ item });
}

export async function deleteItem(c) {
  const id = c.req.param('id');
  const result = await menuService.deleteItem(c, id);
  return c.json(result);
}

export async function toggleItem(c) {
  const id = c.req.param('id');
  const item = await menuService.toggleItemActive(c, id);
  return c.json({ item });
}
