import * as eventRepo from '../repositories/eventRepository.js';
import * as menuSelectionRepo from '../repositories/eventMenuSelectionRepository.js';

/**
 * Submit a public inquiry.
 * Creates an event with status Inquiry, then stores menu selections.
 * @param {import('hono').Context} c
 * @param {{ customer: object, menu_item_ids: number[] }} data
 * @returns {Promise<object>}
 */
export async function submitInquiry(c, data) {
  const event = await eventRepo.create(c, {
    ...data.customer,
    status: 'Inquiry'
  });

  if (data.menu_item_ids.length > 0) {
    await menuSelectionRepo.insertSelections(c, event.id, data.menu_item_ids);
  }

  const created = await eventRepo.findById(c, event.id);
  const selections = data.menu_item_ids.length > 0
    ? await menuSelectionRepo.findByEventId(c, event.id)
    : { results: [] };

  return {
    event: created,
    selections: selections.results || []
  };
}
