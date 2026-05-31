import { ValidationError } from '../core/errors.js';

const VALID_STATUSES = ['Inquiry', 'Quotation Sent', 'Negotiation', 'Confirmed', 'Completed', 'Cancelled'];
const VALID_EVENT_TYPES = ['Wedding', 'Engagement', 'Birthday', 'Corporate', 'Reception', 'Buffet', 'Other'];

/**
 * Validate event creation/update.
 * @param {object} body
 * @param {boolean} isUpdate
 * @returns {object}
 */
export function validateEvent(body, isUpdate = false) {
  const errors = [];

  if (!isUpdate || body.customer_name !== undefined) {
    if (!body?.customer_name?.trim()) errors.push('Customer name is required');
  }
  if (!isUpdate || body.mobile !== undefined) {
    if (!body?.mobile?.trim()) errors.push('Mobile number is required');
    else if (!/^[\d\s\-+]{7,15}$/.test(body.mobile.trim())) errors.push('Invalid mobile number');
  }
  if (!isUpdate || body.event_type !== undefined) {
    if (!body?.event_type?.trim()) errors.push('Event type is required');
  }
  if (!isUpdate || body.event_date !== undefined) {
    if (!body?.event_date) errors.push('Event date is required');
    else if (isNaN(Date.parse(body.event_date))) errors.push('Invalid event date');
  }
  if (!isUpdate || body.guest_count !== undefined) {
    if (body.guest_count !== undefined && body.guest_count !== '') {
      const n = Number(body.guest_count);
      if (!Number.isInteger(n) || n < 0) errors.push('Guest count must be a positive number');
    }
  }
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  return {
    customer_name: body.customer_name?.trim(),
    mobile: body.mobile?.trim(),
    email: body.email?.trim() || '',
    event_type: body.event_type?.trim(),
    event_date: body.event_date,
    venue: body.venue?.trim() || '',
    guest_count: body.guest_count !== undefined && body.guest_count !== '' ? Number(body.guest_count) : 0,
    status: body.status || 'Inquiry',
    notes: body.notes?.trim() || ''
  };
}

/**
 * Validate status update.
 * @param {object} body
 * @returns {{ status: string }}
 */
export function validateStatusUpdate(body) {
  if (!body?.status || !VALID_STATUSES.includes(body.status)) {
    throw new ValidationError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  return { status: body.status };
}
