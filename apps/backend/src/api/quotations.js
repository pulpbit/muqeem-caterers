import { validateQuotation, validateQuotationStatus } from '../validators/quotationValidator.js';
import * as quotationService from '../services/quotationService.js';
import { requireAuth } from '../core/middleware.js';

export async function getQuotationByEvent(c) {
  const eventId = c.req.param('eventId');
  const result = await quotationService.getQuotationByEvent(c, eventId);
  if (!result) return c.json({ quotation: null });
  return c.json({ quotation: result });
}

export async function getQuotation(c) {
  const id = c.req.param('id');
  const result = await quotationService.getQuotationById(c, id);
  return c.json({ quotation: result });
}

export async function createQuotation(c) {
  const body = await c.req.json();
  const data = validateQuotation(body);
  const result = await quotationService.createQuotation(c, data);
  return c.json({ quotation: result }, 201);
}

export async function updateQuotation(c) {
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = validateQuotation(body, true);
  const result = await quotationService.updateQuotation(c, id, data);
  return c.json({ quotation: result });
}

export async function updateQuotationStatus(c) {
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = validateQuotationStatus(body);
  const result = await quotationService.updateQuotationStatus(c, id, data.status);
  return c.json({ quotation: result });
}

export async function deleteQuotation(c) {
  const id = c.req.param('id');
  const result = await quotationService.deleteQuotation(c, id);
  return c.json(result);
}
