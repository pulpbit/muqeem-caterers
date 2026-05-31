import { ValidationError } from '../core/errors.js';

const VALID_EVENT_TYPES = ['Wedding', 'Engagement', 'Birthday', 'Corporate', 'Reception', 'Buffet', 'Other'];

/**
 * Validate public inquiry submission.
 * @param {object} body
 * @returns {{ customer: object, menu_item_ids: number[] }}
 */
export function validateInquiry(body) {
  const errors = [];

  // Customer info
  if (!body?.customer_name?.trim()) errors.push('Customer name is required');
  if (!body?.mobile?.trim()) errors.push('Mobile number is required');
  else if (!/^[\d\s\-+]{7,15}$/.test(body.mobile.trim())) errors.push('Invalid mobile number');
  if (!body?.event_type?.trim()) errors.push('Event type is required');
  if (!body?.event_date) errors.push('Event date is required');
  else if (isNaN(Date.parse(body.event_date))) errors.push('Invalid event date');

  if (body.guest_count !== undefined && body.guest_count !== '') {
    const n = Number(body.guest_count);
    if (!Number.isInteger(n) || n < 0) errors.push('Guest count must be a positive number');
  }

  // Menu selections (optional)
  if (body.menu_item_ids !== undefined) {
    if (!Array.isArray(body.menu_item_ids)) {
      errors.push('Menu selections must be an array');
    }
  }

  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  return {
    customer: {
      customer_name: body.customer_name.trim(),
      mobile: body.mobile.trim(),
      email: body.email?.trim() || '',
      event_type: body.event_type.trim(),
      event_date: body.event_date,
      venue: body.venue?.trim() || '',
      guest_count: body.guest_count !== undefined && body.guest_count !== '' ? Number(body.guest_count) : 0,
      notes: body.notes?.trim() || ''
    },
    menu_item_ids: Array.isArray(body.menu_item_ids) ? body.menu_item_ids.map(Number).filter(n => n > 0) : []
  };
}
