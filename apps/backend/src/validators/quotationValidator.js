import { ValidationError } from '../core/errors.js';

const VALID_STATUSES = ['Draft', 'Sent', 'Approved', 'Rejected'];

export function validateQuotation(body, isUpdate = false) {
  const errors = [];

  if (!isUpdate || body.event_id !== undefined) {
    if (!body?.event_id) errors.push('Event ID is required');
    else if (!Number.isInteger(Number(body.event_id))) errors.push('Invalid Event ID');
  }
  if (!isUpdate || body.rate_per_plate !== undefined) {
    const r = Number(body.rate_per_plate);
    if (isNaN(r) || r < 0) errors.push('Rate per plate must be a positive number');
  }
  if (body.service_fee !== undefined && body.service_fee !== '') {
    const s = Number(body.service_fee);
    if (isNaN(s) || s < 0) errors.push('Service fee must be a positive number');
  }
  if (body.transport_charges !== undefined && body.transport_charges !== '') {
    const t = Number(body.transport_charges);
    if (isNaN(t) || t < 0) errors.push('Transport charges must be a positive number');
  }
  if (body.discount !== undefined && body.discount !== '') {
    const d = Number(body.discount);
    if (isNaN(d) || d < 0) errors.push('Discount must be a positive number');
  }
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  if (body.charges !== undefined) {
    if (!Array.isArray(body.charges)) errors.push('Charges must be an array');
    else {
      for (let i = 0; i < body.charges.length; i++) {
        const ch = body.charges[i];
        if (!ch?.description?.trim()) errors.push(`Charge #${i + 1}: description is required`);
        const amt = Number(ch?.amount);
        if (isNaN(amt) || amt < 0) errors.push(`Charge #${i + 1}: amount must be a positive number`);
      }
    }
  }

  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  return {
    event_id: Number(body.event_id),
    rate_per_plate: Number(body.rate_per_plate) || 0,
    service_fee: Number(body.service_fee) || 0,
    transport_charges: Number(body.transport_charges) || 0,
    discount: Number(body.discount) || 0,
    notes: body.notes?.trim() || '',
    status: body.status || 'Draft',
    charges: Array.isArray(body.charges) ? body.charges : []
  };
}

export function validateQuotationStatus(body) {
  if (!body?.status || !VALID_STATUSES.includes(body.status)) {
    throw new ValidationError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  return { status: body.status };
}
