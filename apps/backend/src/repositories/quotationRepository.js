import { getDB } from '../db/index.js';

export async function generateQuotationCode(c) {
  const db = getDB(c);
  const year = new Date().getFullYear();
  const result = await db
    .prepare("SELECT COUNT(*) AS count FROM quotations WHERE strftime('%Y', created_at) = ?")
    .bind(String(year))
    .first();
  const num = (result?.count || 0) + 1;
  return `QTN-${year}-${String(num).padStart(4, '0')}`;
}

export async function findByEventId(c, eventId) {
  const db = getDB(c);
  return db
    .prepare(`
      SELECT id, event_id, quotation_code, rate_per_plate, service_fee,
             transport_charges, discount, sub_total, total_amount, notes, status, created_at, updated_at
      FROM quotations WHERE event_id = ?
    `)
    .bind(eventId)
    .first();
}

export async function findById(c, id) {
  const db = getDB(c);
  return db
    .prepare(`
      SELECT q.*, e.customer_name, e.event_date, e.guest_count, e.event_type, e.venue, e.mobile, e.email
      FROM quotations q
      JOIN events e ON e.id = q.event_id
      WHERE q.id = ?
    `)
    .bind(id)
    .first();
}

export async function create(c, data) {
  const db = getDB(c);
  const code = await generateQuotationCode(c);

  const result = await db
    .prepare(`
      INSERT INTO quotations (event_id, quotation_code, rate_per_plate, service_fee, transport_charges, discount, sub_total, total_amount, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      data.event_id,
      code,
      data.rate_per_plate,
      data.service_fee,
      data.transport_charges,
      data.discount,
      data.sub_total,
      data.total_amount,
      data.notes || '',
      data.status || 'Draft'
    )
    .run();

  return { id: result.meta.last_row_id, quotation_code: code };
}

export async function update(c, id, data) {
  const db = getDB(c);
  const sets = [];
  const values = [];

  const fields = ['rate_per_plate', 'service_fee', 'transport_charges', 'discount', 'sub_total', 'total_amount', 'notes'];
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
    .prepare(`UPDATE quotations SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
  return result.meta.changes > 0;
}

export async function updateStatus(c, id, status) {
  const db = getDB(c);
  const result = await db
    .prepare("UPDATE quotations SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(status, id)
    .run();
  return result.meta.changes > 0;
}

export async function remove(c, id) {
  const db = getDB(c);
  const result = await db
    .prepare('DELETE FROM quotations WHERE id = ?')
    .bind(id)
    .run();
  return result.meta.changes > 0;
}
