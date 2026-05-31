import { getDB } from '../db/index.js';

export async function findByQuotationId(c, quotationId) {
  const db = getDB(c);
  return db
    .prepare('SELECT id, quotation_id, description, amount FROM quotation_charges WHERE quotation_id = ? ORDER BY id')
    .bind(quotationId)
    .all();
}

export async function insertCharges(c, quotationId, charges) {
  const db = getDB(c);
  const stmt = db.prepare('INSERT INTO quotation_charges (quotation_id, description, amount) VALUES (?, ?, ?)');

  for (const charge of charges) {
    await stmt.bind(quotationId, charge.description, charge.amount).run();
  }
}

export async function deleteByQuotationId(c, quotationId) {
  const db = getDB(c);
  await db
    .prepare('DELETE FROM quotation_charges WHERE quotation_id = ?')
    .bind(quotationId)
    .run();
}
