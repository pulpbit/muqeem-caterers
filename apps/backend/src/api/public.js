import { validateInquiry } from '../validators/publicInquiryValidator.js';
import * as inquiryService from '../services/publicInquiryService.js';

/**
 * POST /api/public/inquiry
 * Public endpoint for customer self-service inquiry.
 */
export async function handlePublicInquiry(c) {
  const body = await c.req.json();
  const data = validateInquiry(body);
  const result = await inquiryService.submitInquiry(c, data);
  return c.json(result, 201);
}
