import { validateEvent, validateStatusUpdate } from '../validators/eventValidator.js';
import * as eventService from '../services/eventService.js';
import { requireAuth } from '../core/middleware.js';

export async function listEvents(c) {
  const result = await eventService.getEvents(c, c.req.query());
  return c.json(result);
}

export async function listAllEvents(c) {
  const result = await eventService.getAllEvents(c, c.req.query());
  return c.json(result);
}

export async function getEvent(c) {
  const id = c.req.param('id');
  const event = await eventService.getEventById(c, id);
  return c.json({ event });
}

export async function createEvent(c) {
  const body = await c.req.json();
  const data = validateEvent(body);
  const event = await eventService.createEvent(c, data);
  return c.json({ event }, 201);
}

export async function updateEvent(c) {
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = validateEvent(body, true);
  const event = await eventService.updateEvent(c, id, data);
  return c.json({ event });
}

export async function updateEventStatus(c) {
  const id = c.req.param('id');
  const body = await c.req.json();
  const data = validateStatusUpdate(body);
  const event = await eventService.updateEventStatus(c, id, data);
  return c.json({ event });
}

export async function deleteEvent(c) {
  const id = c.req.param('id');
  const result = await eventService.deleteEvent(c, id);
  return c.json(result);
}
