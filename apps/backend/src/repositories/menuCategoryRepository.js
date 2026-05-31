import { getDB } from '../db/index.js';

/**
 * Get all categories ordered by display_order.
 * @param {import('hono').Context} c
 * @returns {Promise<Array>}
 */
export async function findAll(c) {
  const db = getDB(c);
  return db
    .prepare('SELECT id, name, display_order FROM menu_categories ORDER BY display_order ASC, id ASC')
    .all();
}

/**
 * Find a category by ID.
 * @param {import('hono').Context} c
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function findById(c, id) {
  const db = getDB(c);
  return db
    .prepare('SELECT id, name, display_order FROM menu_categories WHERE id = ?')
    .bind(id)
    .first();
}

/**
 * Create a new category.
 * @param {import('hono').Context} c
 * @param {{ name: string, display_order: number }} data
 * @returns {Promise<object>} created category
 */
export async function create(c, data) {
  const db = getDB(c);
  const result = await db
    .prepare('INSERT INTO menu_categories (name, display_order) VALUES (?, ?)')
    .bind(data.name, data.display_order)
    .run();
  return { id: result.meta.last_row_id, ...data };
}

/**
 * Update a category.
 * @param {import('hono').Context} c
 * @param {number} id
 * @param {{ name?: string, display_order?: number }} data
 * @returns {Promise<boolean>}
 */
export async function update(c, id, data) {
  const db = getDB(c);
  const sets = [];
  const values = [];

  if (data.name !== undefined) {
    sets.push('name = ?');
    values.push(data.name);
  }
  if (data.display_order !== undefined) {
    sets.push('display_order = ?');
    values.push(data.display_order);
  }

  if (sets.length === 0) return false;

  values.push(id);
  const result = await db
    .prepare(`UPDATE menu_categories SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
  return result.meta.changes > 0;
}

/**
 * Delete a category (only if it has no items).
 * @param {import('hono').Context} c
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function remove(c, id) {
  const db = getDB(c);
  const result = await db
    .prepare('DELETE FROM menu_categories WHERE id = ?')
    .bind(id)
    .run();
  return result.meta.changes > 0;
}
