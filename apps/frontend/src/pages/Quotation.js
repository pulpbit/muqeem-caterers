import { api } from '../services/api.js';
import { showToast } from '../utils/toast.js';
import { authState } from '../utils/authState.js';
import { router } from '../utils/router.js';

export async function quotationPage() {
  renderQuotationPage();

  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('event');
  if (eventId) {
    const select = document.getElementById('q-event-select');
    const checkLoaded = setInterval(() => {
      if (select.options.length > 1) {
        clearInterval(checkLoaded);
        select.value = eventId;
        select.dispatchEvent(new Event('change'));
      }
    }, 50);
    setTimeout(() => clearInterval(checkLoaded), 5000);
  }
}

function renderQuotationPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Quotation</h1>
          <p class="page-subtitle" id="q-page-subtitle">Select an event to create or view a quotation</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="q-back-btn" class="btn btn--secondary btn--sm" style="display:none;">&larr; Back</button>
        </div>
      </div>
      <div id="q-content"></div>
    </div>
    <div id="q-charge-modal"></div>
  `;

  renderEventSelector();
}

function renderEventSelector() {
  const content = document.getElementById('q-content');
  content.innerHTML = `
    <div class="card" style="padding:16px;">
      <label class="form-label" for="q-event-select">Select Event</label>
      <select id="q-event-select" class="form-select">
        <option value="">Loading events...</option>
      </select>
    </div>
    <div id="q-quotation-detail" style="margin-top:16px;"></div>
  `;

  loadEventsForSelector();
}

async function loadEventsForSelector() {
  try {
    const data = await api.get('/events/all');
    const events = data.events || [];
    events.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

    const select = document.getElementById('q-event-select');
    select.innerHTML = '<option value="">-- Choose an event --</option>';

    for (const ev of events) {
      const option = document.createElement('option');
      option.value = ev.id;
      const date = new Date(ev.event_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      option.textContent = `${ev.event_code} - ${ev.customer_name} (${date})`;
      select.appendChild(option);
    }

    select.addEventListener('change', async () => {
      const val = select.value;
      if (val) {
        await loadQuotationForEvent(val);
      } else {
        document.getElementById('q-quotation-detail').innerHTML = '';
        document.getElementById('q-back-btn').style.display = 'none';
      }
    });
  } catch (err) {
    document.getElementById('q-content').innerHTML = `<p style="color:var(--color-danger)">Failed to load events: ${err.message}</p>`;
  }
}

async function loadQuotationForEvent(eventId) {
  const content = document.getElementById('q-quotation-detail');
  content.innerHTML = '<div class="loading-screen" style="min-height:100px;"><div class="spinner"></div></div>';

  try {
    const [qData, eventData] = await Promise.all([
      api.get(`/quotations/event/${eventId}`),
      api.get(`/events/${eventId}`)
    ]);
    const quotation = qData.quotation;
    const event = eventData.event;

    if (event) cachedGuestCount = event.guest_count || 0;

    const sel = document.getElementById('q-event-select');
    const evText = sel.options[sel.selectedIndex]?.text || '';
    document.getElementById('q-page-subtitle').textContent = `Quotation for ${evText}`;
    document.getElementById('q-back-btn').style.display = 'inline-flex';

    if (quotation) {
      renderQuotationView({ ...quotation, guest_count: cachedGuestCount });
    } else {
      renderQuotationForm(eventId);
    }
  } catch (err) {
    content.innerHTML = `<p style="color:var(--color-danger)">Error: ${err.message}</p>`;
  }
}

function renderQuotationView(quotation) {
  const content = document.getElementById('q-quotation-detail');
  const statusColors = {
    'Draft': { bg: '#e8eaed', text: '#5f6368' },
    'Sent': { bg: '#cce5ff', text: '#004085' },
    'Approved': { bg: '#d4edda', text: '#155724' },
    'Rejected': { bg: '#f8d7da', text: '#721c24' }
  };
  const sc = statusColors[quotation.status] || statusColors['Draft'];

  content.innerHTML = `
    <div class="card">
      <div class="card__header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <div>
          <h3 style="font-family:monospace;">${quotation.quotation_code}</h3>
          <p style="font-size:0.813rem;color:var(--color-gray-500);">${quotation.customer_name} &middot; ${formatDate(quotation.event_date)} &middot; ${quotation.guest_count} guests</p>
        </div>
        <span class="badge" style="background:${sc.bg};color:${sc.text};font-size:0.875rem;">${quotation.status}</span>
      </div>
      <div style="padding:16px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tbody>
            <tr><td style="padding:6px 0;color:var(--color-gray-600);font-size:0.875rem;">Rate per plate</td><td style="text-align:right;font-weight:500;font-family:monospace;">₹${Number(quotation.rate_per_plate).toFixed(2)}</td></tr>
            <tr><td style="padding:6px 0;color:var(--color-gray-600);font-size:0.875rem;">Service fee</td><td style="text-align:right;font-weight:500;font-family:monospace;">₹${Number(quotation.service_fee).toFixed(2)}</td></tr>
            <tr><td style="padding:6px 0;color:var(--color-gray-600);font-size:0.875rem;">Transport charges</td><td style="text-align:right;font-weight:500;font-family:monospace;">₹${Number(quotation.transport_charges).toFixed(2)}</td></tr>
            ${(quotation.charges || []).map(ch => `
              <tr><td style="padding:6px 0;color:var(--color-gray-600);font-size:0.875rem;">${escapeHtml(ch.description)}</td><td style="text-align:right;font-weight:500;font-family:monospace;">₹${Number(ch.amount).toFixed(2)}</td></tr>
            `).join('')}
            <tr><td style="padding:6px 0;color:var(--color-danger);font-size:0.875rem;">Discount</td><td style="text-align:right;font-weight:500;font-family:monospace;color:var(--color-danger);">- ₹${Number(quotation.discount).toFixed(2)}</td></tr>
            <tr><td style="padding:8px 0;border-top:2px solid var(--color-gray-300);font-weight:700;">Sub Total</td><td style="text-align:right;font-weight:700;font-family:monospace;border-top:2px solid var(--color-gray-300);">₹${Number(quotation.sub_total).toFixed(2)}</td></tr>
            <tr><td style="padding:6px 0;font-weight:700;font-size:1rem;color:var(--color-primary);">Total Amount</td><td style="text-align:right;font-weight:700;font-family:monospace;font-size:1rem;color:var(--color-primary);">₹${Number(quotation.total_amount).toFixed(2)}</td></tr>
          </tbody>
        </table>
        ${quotation.notes ? `<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--color-gray-200);font-size:0.813rem;color:var(--color-gray-700);"><strong>Notes:</strong> ${escapeHtml(quotation.notes)}</div>` : ''}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid var(--color-gray-200);padding-top:16px;">
        <button class="btn btn--primary btn--sm" id="q-edit-btn">Edit Quotation</button>
        <button class="btn btn--secondary btn--sm" id="q-print-btn" onclick="window.print()">Print</button>
        ${quotation.status === 'Draft' ? `<button class="btn btn--secondary btn--sm" id="q-send-btn">Mark Sent</button>` : ''}
        ${quotation.status === 'Sent' ? `<button class="btn btn--success btn--sm" id="q-approve-btn">Approve</button>` : ''}
        ${quotation.status === 'Sent' ? `<button class="btn btn--danger btn--sm" id="q-reject-btn">Reject</button>` : ''}
      </div>
    </div>
  `;

  document.getElementById('q-edit-btn').addEventListener('click', () => renderQuotationForm(quotation.event_id, quotation));

  const sendBtn = document.getElementById('q-send-btn');
  if (sendBtn) sendBtn.addEventListener('click', () => updateQuotationStatus(quotation.id, 'Sent'));

  const approveBtn = document.getElementById('q-approve-btn');
  if (approveBtn) approveBtn.addEventListener('click', () => updateQuotationStatus(quotation.id, 'Approved'));

  const rejectBtn = document.getElementById('q-reject-btn');
  if (rejectBtn) rejectBtn.addEventListener('click', () => updateQuotationStatus(quotation.id, 'Rejected'));
}

function renderQuotationForm(eventId, existingQuotation = null) {
  const content = document.getElementById('q-quotation-detail');
  const q = existingQuotation;
  const isEdit = !!q;
  const headerText = isEdit ? `Edit ${q.quotation_code}` : 'New Quotation';
  document.getElementById('q-page-subtitle').textContent = headerText;

  const charges = q?.charges || [];

  content.innerHTML = `
    <div class="card">
      <div class="card__header">
        <h3>${headerText}</h3>
      </div>
      <form id="q-form" style="padding:16px 0;">
        <div class="grid grid--2" style="margin-bottom:16px;">
          <div class="form-group">
            <label class="form-label">Rate per Plate (₹) *</label>
            <input type="number" id="q-rate" class="form-input" value="${isEdit ? q.rate_per_plate : ''}" step="0.01" min="0" required>
          </div>
          <div class="form-group">
            <label class="form-label">Service Fee (₹)</label>
            <input type="number" id="q-service-fee" class="form-input" value="${isEdit ? q.service_fee : ''}" step="0.01" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Transport Charges (₹)</label>
            <input type="number" id="q-transport" class="form-input" value="${isEdit ? q.transport_charges : ''}" step="0.01" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">Discount (₹)</label>
            <input type="number" id="q-discount" class="form-input" value="${isEdit ? q.discount : ''}" step="0.01" min="0">
          </div>
        </div>

        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label">Additional Charges</label>
          <div id="q-charges-list">
            ${charges.map((ch, i) => renderChargeRow(i, ch.description, ch.amount)).join('')}
          </div>
          <button type="button" class="btn btn--sm btn--secondary" id="q-add-charge" style="margin-top:4px;">+ Add Charge</button>
        </div>

        <div class="form-group" style="margin-bottom:16px;">
          <label class="form-label">Notes</label>
          <textarea id="q-notes" class="form-textarea">${isEdit ? escapeHtml(q.notes || '') : ''}</textarea>
        </div>

        <div style="border-top:2px solid var(--color-gray-300);padding-top:12px;margin-bottom:16px;">
          <table style="width:100%;border-collapse:collapse;">
            <tbody>
              <tr><td style="padding:4px 0;font-weight:600;">Plate Total</td><td id="q-calc-plate" style="text-align:right;font-family:monospace;">₹0.00</td></tr>
              <tr><td style="padding:4px 0;color:var(--color-gray-600);font-size:0.875rem;">+ Service Fee</td><td id="q-calc-service" style="text-align:right;font-family:monospace;">₹0.00</td></tr>
              <tr><td style="padding:4px 0;color:var(--color-gray-600);font-size:0.875rem;">+ Transport</td><td id="q-calc-transport" style="text-align:right;font-family:monospace;">₹0.00</td></tr>
              <tr><td id="q-calc-charges-label" style="padding:4px 0;color:var(--color-gray-600);font-size:0.875rem;">+ Other Charges</td><td id="q-calc-charges" style="text-align:right;font-family:monospace;">₹0.00</td></tr>
              <tr><td style="padding:4px 0;color:var(--color-danger);font-size:0.875rem;">- Discount</td><td id="q-calc-discount" style="text-align:right;font-family:monospace;color:var(--color-danger);">₹0.00</td></tr>
              <tr><td style="padding:8px 0;border-top:2px solid var(--color-gray-300);font-weight:700;font-size:1rem;color:var(--color-primary);">Total</td><td id="q-calc-total" style="text-align:right;font-weight:700;font-family:monospace;font-size:1rem;border-top:2px solid var(--color-gray-300);color:var(--color-primary);">₹0.00</td></tr>
            </tbody>
          </table>
        </div>

        <p id="q-form-error" style="color:var(--color-danger);font-size:0.875rem;display:none;margin-bottom:8px;"></p>
      </form>
      <div style="display:flex;gap:8px;border-top:1px solid var(--color-gray-200);padding-top:16px;">
        <button class="btn btn--primary" id="q-form-save">${isEdit ? 'Update Quotation' : 'Create Quotation'}</button>
        <button class="btn btn--secondary" id="q-form-cancel">Cancel</button>
      </div>
    </div>
  `;

  cachedGuestCount = q?.guest_count || 0;

  document.getElementById('q-rate').addEventListener('input', recalcTotals);
  document.getElementById('q-service-fee').addEventListener('input', recalcTotals);
  document.getElementById('q-transport').addEventListener('input', recalcTotals);
  document.getElementById('q-discount').addEventListener('input', recalcTotals);

  document.getElementById('q-add-charge').addEventListener('click', () => {
    const list = document.getElementById('q-charges-list');
    const idx = list.children.length;
    list.insertAdjacentHTML('beforeend', renderChargeRow(idx, '', ''));
    recalcTotals();
  });

  document.getElementById('q-charges-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('q-charge-remove')) {
      e.target.closest('.q-charge-row').remove();
      recalcTotals();
    }
  });

  document.getElementById('q-form-save').addEventListener('click', () => saveQuotation(eventId, isEdit ? q.id : null));
  document.getElementById('q-form-cancel').addEventListener('click', () => {
    if (isEdit) {
      loadQuotationForEvent(eventId);
    } else {
      document.getElementById('q-quotation-detail').innerHTML = '';
    }
  });

  recalcTotals();
}

function renderChargeRow(index, description, amount) {
  return `
    <div class="q-charge-row" style="display:flex;gap:8px;margin-bottom:4px;align-items:center;">
      <input type="text" class="form-input" style="flex:1;" placeholder="Description" value="${escapeHtml(description || '')}" data-charge-desc="${index}">
      <input type="number" class="form-input" style="width:120px;" placeholder="Amount" value="${amount || ''}" step="0.01" min="0" data-charge-amt="${index}">
      <button type="button" class="btn btn--sm btn--danger q-charge-remove" data-charge-idx="${index}" style="flex-shrink:0;">&times;</button>
    </div>
  `;
}

function recalcTotals() {
  const rate = Number(document.getElementById('q-rate').value) || 0;
  const serviceFee = Number(document.getElementById('q-service-fee').value) || 0;
  const transport = Number(document.getElementById('q-transport').value) || 0;
  const discount = Number(document.getElementById('q-discount').value) || 0;

  let otherCharges = 0;
  document.querySelectorAll('#q-charges-list [data-charge-amt]').forEach(el => {
    otherCharges += Number(el.value) || 0;
  });

  const plateTotal = rate * guestCountForSelectedEvent();
  const subTotal = plateTotal + serviceFee + transport + otherCharges;
  const total = Math.max(0, subTotal - discount);

  document.getElementById('q-calc-plate').textContent = `₹${plateTotal.toFixed(2)}`;
  document.getElementById('q-calc-service').textContent = `₹${serviceFee.toFixed(2)}`;
  document.getElementById('q-calc-transport').textContent = `₹${transport.toFixed(2)}`;
  document.getElementById('q-calc-charges').textContent = `₹${otherCharges.toFixed(2)}`;
  document.getElementById('q-calc-discount').textContent = `₹${discount.toFixed(2)}`;
  document.getElementById('q-calc-total').textContent = `₹${total.toFixed(2)}`;

  const chargesLabel = document.getElementById('q-calc-charges-label');
  if (chargesLabel) chargesLabel.style.display = otherCharges > 0 ? '' : 'none';
}

let cachedGuestCount = 0;

function guestCountForSelectedEvent() {
  return cachedGuestCount;
}

async function saveQuotation(eventId, existingId) {
  const rate = Number(document.getElementById('q-rate').value) || 0;
  const serviceFee = Number(document.getElementById('q-service-fee').value) || 0;
  const transport = Number(document.getElementById('q-transport').value) || 0;
  const discount = Number(document.getElementById('q-discount').value) || 0;
  const notes = document.getElementById('q-notes').value.trim();

  if (!rate) {
    showFormError('Rate per plate is required');
    return;
  }

  const charges = [];
  document.querySelectorAll('#q-charges-list .q-charge-row').forEach(row => {
    const desc = row.querySelector('[data-charge-desc]').value.trim();
    const amt = Number(row.querySelector('[data-charge-amt]').value) || 0;
    if (desc) {
      charges.push({ description: desc, amount: amt });
    }
  });

  const body = { event_id: Number(eventId), rate_per_plate: rate, service_fee: serviceFee, transport_charges: transport, discount, notes, charges };

  const btn = document.getElementById('q-form-save');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    if (existingId) {
      await api.put(`/quotations/${existingId}`, body);
      showToast('Quotation updated', 'success');
    } else {
      await api.post('/quotations', body);
      showToast('Quotation created', 'success');
    }
    await loadQuotationForEvent(eventId);
  } catch (err) {
    showFormError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = existingId ? 'Update Quotation' : 'Create Quotation';
  }
}

async function updateQuotationStatus(id, status) {
  try {
    const result = await api.patch(`/quotations/${id}/status`, { status });
    showToast(`Quotation ${status}`, 'success');
    await loadQuotationForEvent(result.quotation.event_id);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showFormError(msg) {
  const el = document.getElementById('q-form-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
