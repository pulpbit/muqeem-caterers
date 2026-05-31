import { getDB } from '../db/index.js';

/**
 * Get all items, optionally filtered by category.
 * @param {import('hono').Context} c
 * @param {{ category_id?: number, active_only?: boolean }} options
 * @returns {Promise<Array>}
 */
export async function findAll(c, options = {}) {
  const db = getDB(c);
  const conditions = [];
  const values = [];

  if (options.category_id) {
    conditions.push('mi.category_id = ?');
    values.push(options.category_id);
  }

  if (options.active_only) {
    conditions.push('mi.is_active = 1');
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return db
    .prepare(`
      SELECT mi.id, mi.category_id, mi.name, mi.description, mi.image_url, mi.is_active,
             mc.name AS category_name
      FROM menu_items mi
      JOIN menu_categories mc ON mc.id = mi.category_id
      ${where}
      ORDER BY mc.display_order, mi.name ASC
    `)
    .bind(...values)
    .all();
}

/**
 * Find an item by ID.
 * @param {import('hono').Context} c
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function findById(c, id) {
  const db = getDB(c);
  return db
    .prepare(`
      SELECT mi.id, mi.category_id, mi.name, mi.description, mi.image_url, mi.is_active,
             mc.name AS category_name
      FROM menu_items mi
      JOIN menu_categories mc ON mc.id = mi.category_id
      WHERE mi.id = ?
    `)
    .bind(id)
    .first();
}

/**
 * Create a new menu item.
 * @param {import('hono').Context} c
 * @param {{ category_id: number, name: string, description?: string, is_active?: number }} data
 * @returns {Promise<object>}
 */
export async function create(c, data) {
  const db = getDB(c);
  const result = await db
    .prepare('INSERT INTO menu_items (category_id, name, description, image_url, is_active) VALUES (?, ?, ?, ?, ?)')
    .bind(data.category_id, data.name, data.description || '', '', data.is_active !== undefined ? data.is_active : 1)
    .run();
  return { id: result.meta.last_row_id, ...data, image_url: '' };
}

/**
 * Update a menu item.
 * @param {import('hono').Context} c
 * @param {number} id
 * @param {object} data
 * @returns {Promise<boolean>}
 */
export async function update(c, id, data) {
  const db = getDB(c);
  const sets = [];
  const values = [];

  const fields = ['category_id', 'name', 'description', 'image_url', 'is_active'];
  for (const field of fields) {
    if (data[field] !== undefined) {
      sets.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (sets.length === 0) return false;

  values.push(id);
  const result = await db
    .prepare(`UPDATE menu_items SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
  return result.meta.changes > 0;
}

/**
 * Delete a menu item.
 * @param {import('hono').Context} c
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function remove(c, id) {
  const db = getDB(c);
  const result = await db
    .prepare('DELETE FROM menu_items WHERE id = ?')
    .bind(id)
    .run();
  return result.meta.changes > 0;
}

/**
 * Toggle is_active for an item.
 * @param {import('hono').Context} c
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function toggleActive(c, id) {
  const db = getDB(c);
  const result = await db
    .prepare('UPDATE menu_items SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?')
    .bind(id)
    .run();
  return result.meta.changes > 0;
}

/**
 * Count items in a category.
 * @param {import('hono').Context} c
 * @param {number} categoryId
 * @returns {Promise<number>}
 */
export async function countByCategory(c, categoryId) {
  const db = getDB(c);
  const result = await db
    .prepare('SELECT COUNT(*) AS count FROM menu_items WHERE category_id = ?')
    .bind(categoryId)
    .first();
  return result ? result.count : 0;
}
