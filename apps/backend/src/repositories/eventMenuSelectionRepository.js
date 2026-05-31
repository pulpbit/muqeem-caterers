import { getDB } from '../db/index.js';

/**
 * Insert menu selections for an event.
 * @param {import('hono').Context} c
 * @param {number} eventId
 * @param {number[]} menuItemIds
 */
export async function insertSelections(c, eventId, menuItemIds) {
  const db = getDB(c);
  const stmt = db.prepare('INSERT INTO event_menu_selections (event_id, menu_item_id) VALUES (?, ?)');

  for (const itemId of menuItemIds) {
    await stmt.bind(eventId, itemId).run();
  }
}

/**
 * Get menu selections for an event, grouped by category.
 * @param {import('hono').Context} c
 * @param {number} eventId
 * @returns {Promise<Array>}
 */
export async function findByEventId(c, eventId) {
  const db = getDB(c);
  return db
    .prepare(`
      SELECT ems.id, ems.menu_item_id, mi.name AS item_name, mi.category_id,
             mc.name AS category_name
      FROM event_menu_selections ems
      JOIN menu_items mi ON mi.id = ems.menu_item_id
      JOIN menu_categories mc ON mc.id = mi.category_id
      WHERE ems.event_id = ?
      ORDER BY mc.display_order, mi.name
    `)
    .bind(eventId)
    .all();
}

/**
 * Delete all menu selections for an event (used when re-selecting).
 * @param {import('hono').Context} c
 * @param {number} eventId
 */
export async function deleteByEventId(c, eventId) {
  const db = getDB(c);
  await db
    .prepare('DELETE FROM event_menu_selections WHERE event_id = ?')
    .bind(eventId)
    .run();
}
