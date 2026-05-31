import { api } from '../services/api.js';
import { showToast } from '../utils/toast.js';
import { authState } from '../utils/authState.js';

const STATUS_COLORS = {
  'Inquiry': { bg: '#fef3cd', text: '#856404' },
  'Quotation Sent': { bg: '#cce5ff', text: '#004085' },
  'Negotiation': { bg: '#ffe0b2', text: '#e65100' },
  'Confirmed': { bg: '#d4edda', text: '#155724' },
  'Completed': { bg: '#e8eaed', text: '#5f6368' },
  'Cancelled': { bg: '#f8d7da', text: '#721c24' }
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EVENT_TYPES = ['Wedding', 'Engagement', 'Birthday', 'Corporate', 'Reception', 'Buffet', 'Other'];

let currentYear, currentMonth;
let events = [];
let viewMode = 'calendar'; // 'calendar' | 'list'
let selectedDate = null;
let editingEventId = null;

export async function calendarPage() {
  const now = new Date();
  currentYear = now.getFullYear();
  currentMonth = now.getMonth() + 1;
  events = [];
  viewMode = 'calendar';
  selectedDate = null;
  editingEventId = null;

  renderPage();
  loadEvents();
}

function renderPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Event Calendar</h1>
          <p class="page-subtitle">Manage your catering events</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="btn-toggle-view" class="btn btn--secondary btn--sm">${viewMode === 'calendar' ? 'List View' : 'Calendar View'}</button>
          <button id="btn-add-event" class="btn btn--primary btn--sm">+ New Event</button>
        </div>
      </div>
      <div id="calendar-loading" class="loading-screen" style="min-height:150px;">
        <div class="spinner"></div>
        <p>Loading events...</p>
      </div>
      <div id="calendar-content" style="display:none;"></div>
    </div>
    <div id="event-detail"></div>
    <div id="event-modal"></div>
  `;

  document.getElementById('btn-toggle-view').addEventListener('click', () => {
    viewMode = viewMode === 'calendar' ? 'list' : 'calendar';
    renderContent();
  });

  document.getElementById('btn-add-event').addEventListener('click', () => openEventModal());
}

async function loadEvents() {
  try {
    const data = await api.get(`/events?year=${currentYear}&month=${currentMonth}`);
    events = data.events || [];
    document.getElementById('calendar-loading').style.display = 'none';
    document.getElementById('calendar-content').style.display = 'block';
    renderContent();
  } catch (err) {
    document.getElementById('calendar-loading').innerHTML = `
      <p style="color:var(--color-danger)">Failed to load events: ${err.message}</p>
      <button class="btn btn--primary" onclick="location.reload()">Retry</button>
    `;
  }
}

function renderContent() {
  if (viewMode === 'calendar') {
    renderCalendar();
  } else {
    renderListView();
  }
}

// ─── Calendar View ───

function renderCalendar() {
  const container = document.getElementById('calendar-content');
  const monthName = new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

  const eventsByDate = {};
  for (const ev of events) {
    const date = ev.event_date.split('T')[0];
    if (!eventsByDate[date]) eventsByDate[date] = [];
    eventsByDate[date].push(ev);
  }

  const today = new Date().toISOString().split('T')[0];

  let cells = [];

  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dateStr = `${currentYear}-${String(currentMonth - 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ day, dateStr, otherMonth: true });
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({ day, dateStr, otherMonth: false, isToday: dateStr === today });
  }

  // Next month padding
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let day = 1; day <= remaining; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ day, dateStr, otherMonth: true });
    }
  }

  const eventColors = (dateStr) => {
    const dayEvents = eventsByDate[dateStr] || [];
    const colors = dayEvents.map(ev => {
      const c = STATUS_COLORS[ev.status] || { bg: '#e8eaed', text: '#5f6368' };
      return c.bg;
    });
    return [...new Set(colors)];
  };

  container.innerHTML = `
    <div class="calendar-nav">
      <button id="cal-prev" class="btn btn--sm btn--secondary">&larr; Prev</button>
      <h3>${monthName}</h3>
      <button id="cal-next" class="btn btn--sm btn--secondary">Next &rarr;</button>
    </div>
    <div class="calendar-grid">
      ${DAY_NAMES.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
      ${cells.map(cell => {
        const dayEvents = eventsByDate[cell.dateStr] || [];
        const colors = eventColors(cell.dateStr);
        const dotsHtml = colors.length > 0
          ? `<div class="cal-dots">${colors.map(c => `<span style="background:${c}"></span>`).join('')}</div>`
          : '';
        return `
          <div class="calendar-cell ${cell.otherMonth ? 'other-month' : ''} ${cell.isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}"
               data-date="${cell.dateStr}">
            <span class="cal-day-num">${cell.day}</span>
            ${dotsHtml}
            ${dayEvents.length > 0 ? `<span class="cal-event-count">${dayEvents.length}</span>` : ''}
          </div>
        `;
      }).join('')}
    </div>
    <div id="calendar-selected" style="margin-top:16px;"></div>
  `;

  document.getElementById('cal-prev').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 1) { currentMonth = 12; currentYear--; }
    loadEvents();
  });

  document.getElementById('cal-next').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 12) { currentMonth = 1; currentYear++; }
    loadEvents();
  });

  container.querySelectorAll('.calendar-cell').forEach(cell => {
    cell.addEventListener('click', () => showDayEvents(cell.dataset.date));
  });
}

function showDayEvents(dateStr) {
  const container = document.getElementById('calendar-selected');
  const dayEvents = events.filter(e => e.event_date.startsWith(dateStr));
  const date = new Date(dateStr + 'T00:00:00');
  const dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (dayEvents.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:16px;">
        <p style="color:var(--color-gray-500);font-size:0.875rem;">${dateLabel} — No events</p>
        <button class="btn btn--primary btn--sm" onclick="document.getElementById('btn-add-event').click()" style="margin-top:8px;">Add Event</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card">
      <h4 style="margin-bottom:12px;font-size:0.938rem;">${dateLabel}</h4>
      ${dayEvents.map(ev => `
        <div class="event-row" data-event-id="${ev.id}">
          <span class="badge badge--${statusBadgeClass(ev.status)}">${ev.status}</span>
          <span style="font-weight:500;">${escapeHtml(ev.customer_name)}</span>
          <span style="color:var(--color-gray-500);font-size:0.813rem;">${ev.event_type} · ${ev.guest_count || '?'} guests</span>
          <div class="event-row-actions">
            <button class="btn btn--sm btn--secondary" data-view-event="${ev.id}">View</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('[data-view-event]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEventDetail(Number(btn.dataset.viewEvent));
    });
  });
}

// ─── List View ───

function renderListView() {
  const container = document.getElementById('calendar-content');
  const sorted = [...events].sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

  if (sorted.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:32px;">
        <p style="color:var(--color-gray-500);">No events this month.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Type</th>
            <th>Guests</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map(ev => `
            <tr>
              <td style="font-family:monospace;font-size:0.813rem;">${ev.event_code}</td>
              <td>${formatDate(ev.event_date)}</td>
              <td>${escapeHtml(ev.customer_name)}</td>
              <td>${ev.event_type}</td>
              <td>${ev.guest_count || '-'}</td>
              <td><span class="badge badge--${statusBadgeClass(ev.status)}">${ev.status}</span></td>
              <td><button class="btn btn--sm btn--secondary" data-view-event="${ev.id}">View</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('[data-view-event]').forEach(btn => {
    btn.addEventListener('click', () => openEventDetail(Number(btn.dataset.viewEvent)));
  });
}

// ─── Event Detail Modal ───

function openEventDetail(id) {
  const ev = events.find(e => e.id === id);
  if (!ev) return;

  const isAdmin = authState.isLoggedIn;
  const colors = STATUS_COLORS[ev.status] || { bg: '#e8eaed', text: '#5f6368' };
  const statusOptions = ['Inquiry', 'Quotation Sent', 'Negotiation', 'Confirmed', 'Completed', 'Cancelled'];

  const detail = document.getElementById('event-detail');
  detail.innerHTML = `
    <div class="modal-overlay">
      <div class="modal" style="max-width:500px;">
        <div class="modal__header">
          <h3 class="modal__title">${ev.event_code}</h3>
          <button class="modal__close" id="detail-close">&times;</button>
        </div>
        <div class="modal__body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label class="form-label">Customer</label>
              <p style="font-weight:500;">${escapeHtml(ev.customer_name)}</p>
            </div>
            <div>
              <label class="form-label">Mobile</label>
              <p>${ev.mobile}</p>
            </div>
            <div>
              <label class="form-label">Event Type</label>
              <p>${ev.event_type}</p>
            </div>
            <div>
              <label class="form-label">Date</label>
              <p>${formatDate(ev.event_date)}</p>
            </div>
            <div>
              <label class="form-label">Venue</label>
              <p>${ev.venue || '-'}</p>
            </div>
            <div>
              <label class="form-label">Guests</label>
              <p>${ev.guest_count || '-'}</p>
            </div>
            <div style="grid-column:span 2;">
              <label class="form-label">Status</label>
              <span class="badge" style="background:${colors.bg};color:${colors.text};">${ev.status}</span>
            </div>
            ${ev.email ? `<div style="grid-column:span 2;"><label class="form-label">Email</label><p>${escapeHtml(ev.email)}</p></div>` : ''}
            ${ev.notes ? `<div style="grid-column:span 2;"><label class="form-label">Notes</label><p style="font-size:0.875rem;color:var(--color-gray-700)">${escapeHtml(ev.notes)}</p></div>` : ''}
          </div>

          ${isAdmin ? `
            <hr style="margin:16px 0;border:none;border-top:1px solid var(--color-gray-200);">
            <label class="form-label" for="detail-status">Update Status</label>
            <div style="display:flex;gap:8px;margin-top:4px;">
              <select id="detail-status" class="form-select" style="flex:1;">
                ${statusOptions.map(s => `<option value="${s}" ${s === ev.status ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
              <button class="btn btn--primary btn--sm" id="detail-update-status">Update</button>
            </div>
          ` : ''}
        </div>
        <div class="modal__footer">
          ${isAdmin ? `<button class="btn btn--secondary" id="detail-edit">Edit</button>` : ''}
          <button class="btn btn--secondary" id="detail-close-btn">Close</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('detail-close').addEventListener('click', closeDetail);
  document.getElementById('detail-close-btn').addEventListener('click', closeDetail);
  detail.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeDetail();
  });

  const editBtn = document.getElementById('detail-edit');
  if (editBtn) editBtn.addEventListener('click', () => { closeDetail(); openEventModal(ev); });

  const updateBtn = document.getElementById('detail-update-status');
  if (updateBtn) {
    updateBtn.addEventListener('click', async () => {
      const newStatus = document.getElementById('detail-status').value;
      try {
        const result = await api.patch(`/events/${ev.id}/status`, { status: newStatus });
        const idx = events.findIndex(e => e.id === ev.id);
        if (idx >= 0) events[idx] = result.event;
        closeDetail();
        renderContent();
        showToast(`Status updated to "${newStatus}"`, 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  }
}

// ─── Add/Edit Event Modal ───

function openEventModal(event = null) {
  editingEventId = event ? event.id : null;
  const isEdit = !!event;
  const colors = STATUS_COLORS[event?.status] || STATUS_COLORS['Inquiry'];

  const modal = document.getElementById('event-modal');
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal__header">
          <h3 class="modal__title">${isEdit ? 'Edit' : 'New'} Event</h3>
          <button class="modal__close" id="modal-close">&times;</button>
        </div>
        <div class="modal__body">
          <form id="event-form">
            <div class="grid grid--2">
              <div class="form-group">
                <label class="form-label">Customer Name *</label>
                <input type="text" id="ev-customer" class="form-input" value="${isEdit ? escapeHtml(event.customer_name) : ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Mobile *</label>
                <input type="tel" id="ev-mobile" class="form-input" value="${isEdit ? escapeHtml(event.mobile) : ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="ev-email" class="form-input" value="${isEdit ? escapeHtml(event.email || '') : ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Event Type *</label>
                <select id="ev-type" class="form-select">
                  ${EVENT_TYPES.map(t => `<option value="${t}" ${isEdit && event.event_type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Event Date *</label>
                <input type="date" id="ev-date" class="form-input" value="${isEdit ? event.event_date.split('T')[0] : ''}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Guest Count</label>
                <input type="number" id="ev-guests" class="form-input" value="${isEdit ? event.guest_count : ''}" min="0">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Venue</label>
              <input type="text" id="ev-venue" class="form-input" value="${isEdit ? escapeHtml(event.venue || '') : ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select id="ev-status" class="form-select">
                ${['Inquiry', 'Quotation Sent', 'Negotiation', 'Confirmed', 'Completed', 'Cancelled'].map(s =>
                  `<option value="${s}" ${isEdit && event.status === s ? 'selected' : ''}>${s}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Notes</label>
              <textarea id="ev-notes" class="form-textarea">${isEdit ? escapeHtml(event.notes || '') : ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn--primary" id="modal-save">${isEdit ? 'Update' : 'Create'}</button>
        </div>
        <p id="event-form-error" style="color:var(--color-danger);text-align:center;padding:0 24px 16px;font-size:0.875rem;display:none;"></p>
      </div>
    </div>
  `;

  document.getElementById('modal-close').addEventListener('click', closeEventModal);
  document.getElementById('modal-cancel').addEventListener('click', closeEventModal);
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeEventModal();
  });

  document.getElementById('modal-save').addEventListener('click', saveEvent);
  document.getElementById('event-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveEvent();
  });
}

async function saveEvent() {
  const data = {
    customer_name: document.getElementById('ev-customer').value.trim(),
    mobile: document.getElementById('ev-mobile').value.trim(),
    email: document.getElementById('ev-email').value.trim(),
    event_type: document.getElementById('ev-type').value,
    event_date: document.getElementById('ev-date').value,
    guest_count: parseInt(document.getElementById('ev-guests').value) || 0,
    venue: document.getElementById('ev-venue').value.trim(),
    status: document.getElementById('ev-status').value,
    notes: document.getElementById('ev-notes').value.trim()
  };

  if (!data.customer_name || !data.mobile || !data.event_date) {
    showEventError('Customer name, mobile, and date are required');
    return;
  }

  const btn = document.getElementById('modal-save');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    if (editingEventId) {
      const result = await api.put(`/events/${editingEventId}`, data);
      const idx = events.findIndex(e => e.id === editingEventId);
      if (idx >= 0) events[idx] = result.event;
      showToast('Event updated', 'success');
    } else {
      const result = await api.post('/events', data);
      events.push(result.event);
      showToast('Event created', 'success');
    }
    closeEventModal();
    renderContent();
  } catch (err) {
    showEventError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = editingEventId ? 'Update' : 'Create';
  }
}

function closeDetail() {
  document.getElementById('event-detail').innerHTML = '';
}

function closeEventModal() {
  document.getElementById('event-modal').innerHTML = '';
  editingEventId = null;
}

function showEventError(msg) {
  const el = document.getElementById('event-form-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

// ─── Utilities ───

function statusBadgeClass(status) {
  const map = {
    'Inquiry': 'inquiry',
    'Quotation Sent': 'quotation',
    'Negotiation': 'negotiation',
    'Confirmed': 'confirmed',
    'Completed': 'completed',
    'Cancelled': 'cancelled'
  };
  return map[status] || 'inquiry';
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
