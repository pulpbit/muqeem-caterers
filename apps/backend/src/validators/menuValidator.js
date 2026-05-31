import { ValidationError } from '../core/errors.js';

/**
 * Validate category creation/update.
 * @param {object} body
 * @param {boolean} isUpdate
 * @returns {object}
 */
export function validateCategory(body, isUpdate = false) {
  const errors = [];

  if (!isUpdate || body.name !== undefined) {
    if (!body || !body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Category name is required');
    }
  }

  if (body.display_order !== undefined) {
    const order = Number(body.display_order);
    if (!Number.isInteger(order) || order < 0) {
      errors.push('Display order must be a positive integer');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }

  return {
    name: body.name ? body.name.trim() : undefined,
    display_order: body.display_order !== undefined ? Number(body.display_order) : undefined
  };
}

/**
 * Validate menu item creation/update.
 * @param {object} body
 * @param {boolean} isUpdate
 * @returns {object}
 */
export function validateMenuItem(body, isUpdate = false) {
  const errors = [];

  if (!isUpdate || body.category_id !== undefined) {
    const catId = Number(body.category_id);
    if (!body.category_id || !Number.isInteger(catId) || catId < 1) {
      errors.push('Valid category_id is required');
    }
  }

  if (!isUpdate || body.name !== undefined) {
    if (!body || !body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('Item name is required');
    }
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }

  return {
    category_id: body.category_id !== undefined ? Number(body.category_id) : undefined,
    name: body.name ? body.name.trim() : undefined,
    description: body.description !== undefined ? body.description.trim() : undefined,
    is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : undefined
  };
}
