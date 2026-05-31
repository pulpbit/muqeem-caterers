import { NotFoundError } from '../core/errors.js';
import * as eventRepo from '../repositories/eventRepository.js';
import * as menuSelRepo from '../repositories/eventMenuSelectionRepository.js';

export async function getEvents(c, query = {}) {
  const year = parseInt(query.year) || new Date().getFullYear();
  const month = parseInt(query.month) || (new Date().getMonth() + 1);

  const { results } = await eventRepo.findByMonth(c, year, month);
  return { events: results || [], year, month };
}

export async function getAllEvents(c, query = {}) {
  const options = {};
  if (query.status) options.status = query.status;
  if (query.limit) options.limit = parseInt(query.limit);
  const { results } = await eventRepo.findAll(c, options);
  return { events: results || [] };
}

export async function getEventById(c, id) {
  id = Number(id);
  const event = await eventRepo.findById(c, id);
  if (!event) throw new NotFoundError('Event not found');
  return event;
}

export async function getEventWithSelections(c, id) {
  id = Number(id);
  const event = await eventRepo.findById(c, id);
  if (!event) throw new NotFoundError('Event not found');

  const { results } = await menuSelRepo.findByEventId(c, id);

  return { event, menu_selections: results || [] };
}

export async function createEvent(c, data) {
  const created = await eventRepo.create(c, data);
  return eventRepo.findById(c, created.id);
}

export async function updateEvent(c, id, data) {
  id = Number(id);
  await getEventById(c, id);
  await eventRepo.update(c, id, data);
  return eventRepo.findById(c, id);
}

export async function updateEventStatus(c, id, data) {
  id = Number(id);
  await getEventById(c, id);
  await eventRepo.update(c, id, { status: data.status });
  return eventRepo.findById(c, id);
}

export async function deleteEvent(c, id) {
  id = Number(id);
  await getEventById(c, id);
  await eventRepo.remove(c, id);
  return { message: 'Event deleted' };
}
