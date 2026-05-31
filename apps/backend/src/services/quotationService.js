import { NotFoundError } from '../core/errors.js';
import * as quotationRepo from '../repositories/quotationRepository.js';
import * as chargeRepo from '../repositories/quotationChargeRepository.js';
import * as eventRepo from '../repositories/eventRepository.js';
import * as eventService from './eventService.js';

function computeTotals(data) {
  const guestCount = data.guest_count || 0;
  const ratePerPlate = data.rate_per_plate || 0;
  const serviceFee = data.service_fee || 0;
  const transportCharges = data.transport_charges || 0;
  const charges = data.charges || [];
  const discount = data.discount || 0;

  const plateTotal = ratePerPlate * guestCount;
  const extraCharges = charges.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const subTotal = plateTotal + serviceFee + transportCharges + extraCharges;
  const totalAmount = Math.max(0, subTotal - discount);

  return { sub_total: subTotal, total_amount: totalAmount };
}

export async function getQuotationByEvent(c, eventId) {
  const quotation = await quotationRepo.findByEventId(c, eventId);
  if (!quotation) return null;

  const { results: charges } = await chargeRepo.findByQuotationId(c, quotation.id);
  return { ...quotation, charges: charges || [] };
}

export async function getQuotationById(c, id) {
  id = Number(id);
  const quotation = await quotationRepo.findById(c, id);
  if (!quotation) throw new NotFoundError('Quotation not found');

  const { results: charges } = await chargeRepo.findByQuotationId(c, id);
  return { ...quotation, charges: charges || [] };
}

export async function createQuotation(c, data) {
  const event = await eventRepo.findById(c, data.event_id);
  if (!event) throw new NotFoundError('Event not found');

  const existing = await quotationRepo.findByEventId(c, data.event_id);
  if (existing) throw new NotFoundError('Quotation already exists for this event');

  const totals = computeTotals({ ...data, guest_count: event.guest_count });

  const created = await quotationRepo.create(c, {
    event_id: data.event_id,
    rate_per_plate: data.rate_per_plate,
    service_fee: data.service_fee,
    transport_charges: data.transport_charges,
    discount: data.discount,
    sub_total: totals.sub_total,
    total_amount: totals.total_amount,
    notes: data.notes,
    status: data.status
  });

  if (data.charges.length > 0) {
    await chargeRepo.insertCharges(c, created.id, data.charges);
  }

  return getQuotationById(c, created.id);
}

export async function updateQuotation(c, id, data) {
  id = Number(id);
  const quotation = await quotationRepo.findById(c, id);
  if (!quotation) throw new NotFoundError('Quotation not found');

  const event = await eventRepo.findById(c, quotation.event_id);
  const totals = computeTotals({ ...data, guest_count: event.guest_count });

  await quotationRepo.update(c, id, {
    rate_per_plate: data.rate_per_plate,
    service_fee: data.service_fee,
    transport_charges: data.transport_charges,
    discount: data.discount,
    sub_total: totals.sub_total,
    total_amount: totals.total_amount,
    notes: data.notes
  });

  await chargeRepo.deleteByQuotationId(c, id);
  if (data.charges.length > 0) {
    await chargeRepo.insertCharges(c, id, data.charges);
  }

  return getQuotationById(c, id);
}

export async function updateQuotationStatus(c, id, status) {
  id = Number(id);
  const quotation = await quotationRepo.findById(c, id);
  if (!quotation) throw new NotFoundError('Quotation not found');

  await quotationRepo.updateStatus(c, id, status);

  if (status === 'Approved') {
    await eventService.updateEventStatus(c, quotation.event_id, { status: 'Confirmed' });
  }

  return getQuotationById(c, id);
}

export async function deleteQuotation(c, id) {
  id = Number(id);
  const quotation = await quotationRepo.findById(c, id);
  if (!quotation) throw new NotFoundError('Quotation not found');

  await chargeRepo.deleteByQuotationId(c, id);
  await quotationRepo.remove(c, id);
  return { message: 'Quotation deleted' };
}
