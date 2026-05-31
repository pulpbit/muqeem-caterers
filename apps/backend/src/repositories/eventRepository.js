import { getDB } from '../db/index.js';

/**
 * Generate the next event code: EVT-YYYY-NNNN
 * @param {import('hono').Context} c
 * @returns {Promise<string>}
 */
export async function generateEventCode(c) {
  const db = getDB(c);
  const year = new Date().getFullYear();
  const result = await db
    .prepare("SELECT COUNT(*) AS count FROM events WHERE strftime('%Y', created_at) = ?")
    .bind(String(year))
    .first();
  const num = (result?.count || 0) + 1;
  return `EVT-${year}-${String(num).padStart(4, '0')}`;
}

/**
 * Find events within a year/month range.
 * @param {import('hono').Context} c
 * @param {number} year
 * @param {number} month (1-12)
 * @returns {Promise<Array>}
 */
export async function findByMonth(c, year, month) {
  const db = getDB(c);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const end = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  return db
    .prepare(`
      SELECT id, event_code, customer_name, mobile, email, event_type,
             event_date, venue, guest_count, status, notes, created_at
      FROM events
      WHERE event_date >= ? AND event_date < ?
      ORDER BY event_date ASC
    `)
    .bind(start, end)
    .all();
}

/**
 * Find all events (with optional filters).
 * @param {import('hono').Context} c
 * @param {{ status?: string, limit?: number }} options
 * @returns {Promise<Array>}
 */
export async function findAll(c, options = {}) {
  const db = getDB(c);
  const conditions = [];
  const values = [];

  if (options.status) {
    conditions.push('status = ?');
    values.push(options.status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = options.limit ? `LIMIT ${options.limit}` : '';

  return db
    .prepare(`
      SELECT id, event_code, customer_name, mobile, email, event_type,
             event_date, venue, guest_count, status, notes, created_at
      FROM events
      ${where}
      ORDER BY event_date DESC
      ${limit}
    `)
    .bind(...values)
    .all();
}

/**
 * Find an event by ID.
 * @param {import('hono').Context} c
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function findById(c, id) {
  const db = getDB(c);
  return db
    .prepare(`
      SELECT id, event_code, customer_name, mobile, email, event_type,
             event_date, venue, guest_count, status, notes, created_at
      FROM events WHERE id = ?
    `)
    .bind(id)
    .first();
}

/**
 * Create a new event.
 * @param {import('hono').Context} c
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function create(c, data) {
  const db = getDB(c);
  const code = await generateEventCode(c);

  const result = await db
    .prepare(`
      INSERT INTO events (event_code, customer_name, mobile, email, event_type, event_date, venue, guest_count, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      code,
      data.customer_name,
      data.mobile,
      data.email || '',
      data.event_type,
      data.event_date,
      data.venue || '',
      data.guest_count || 0,
      data.status || 'Inquiry',
      data.notes || ''
    )
    .run();

  return { id: result.meta.last_row_id, event_code: code, ...data };
}

/**
 * Update an event.
 * @param {import('hono').Context} c
 * @param {number} id
 * @param {object} data
 * @returns {Promise<boolean>}
 */
export async function update(c, id, data) {
  const db = getDB(c);
  const sets = [];
  const values = [];

  const fields = ['customer_name', 'mobile', 'email', 'event_type', 'event_date', 'venue', 'guest_count', 'status', 'notes'];
  for (const field of fields) {
    if (data[field] !== undefined) {
      sets.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (sets.length === 0) return false;

  sets.push("updated_at = datetime('now')");
  values.push(id);

  const result = await db
    .prepare(`UPDATE events SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
  return result.meta.changes > 0;
}

/**
 * Delete an event.
 * @param {import('hono').Context} c
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function remove(c, id) {
  const db = getDB(c);
  const result = await db
    .prepare('DELETE FROM events WHERE id = ?')
    .bind(id)
    .run();
  return result.meta.changes > 0;
}
