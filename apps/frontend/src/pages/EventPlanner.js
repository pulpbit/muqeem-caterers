import { api } from '../services/api.js';
import { showToast } from '../utils/toast.js';

let categories = [];
let items = [];
let submitting = false;

export async function eventPlannerPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container" style="max-width:800px;">
      <div style="text-align:center;margin-bottom:32px;">
        <h1 class="page-title">Plan Your Event</h1>
        <p class="page-subtitle">Tell us about your event and select your preferred menu.</p>
      </div>
      <div id="planner-loading" class="loading-screen" style="min-height:200px;">
        <div class="spinner"></div>
        <p>Loading menu...</p>
      </div>
      <div id="planner-form" style="display:none;"></div>
    </div>
  `;

  try {
    const [catData, itemData] = await Promise.all([
      api.get('/menu/categories'),
      api.get('/menu/items')
    ]);
    categories = catData.categories || [];
    items = itemData.items || [];

    document.getElementById('planner-loading').style.display = 'none';
    document.getElementById('planner-form').style.display = 'block';
    renderForm(null);
  } catch (err) {
    document.getElementById('planner-loading').innerHTML = `
      <p style="color:var(--color-danger)">Failed to load. Please try again.</p>
      <button class="btn btn--primary" onclick="location.reload()">Retry</button>
    `;
  }
}

function renderForm(submittedData) {
  const container = document.getElementById('planner-form');

  if (submittedData) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:48px 24px;">
        <div style="font-size:3rem;margin-bottom:16px;">&#10003;</div>
        <h2 style="margin-bottom:8px;">Inquiry Submitted!</h2>
        <p style="color:var(--color-gray-600);margin-bottom:4px;">
          Your event <strong>${submittedData.event.event_code}</strong> has been received.
        </p>
        <p style="color:var(--color-gray-500);font-size:0.875rem;margin-bottom:24px;">
          We will contact you at <strong>${submittedData.event.mobile}</strong> with a quotation.
        </p>
        <div style="background:var(--color-gray-50);border-radius:var(--radius-md);padding:16px;text-align:left;margin-bottom:24px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.875rem;">
            <div><strong>Event Code:</strong> ${submittedData.event.event_code}</div>
            <div><strong>Status:</strong> <span class="badge badge--inquiry">Inquiry</span></div>
            <div><strong>Date:</strong> ${formatDate(submittedData.event.event_date)}</div>
            <div><strong>Guests:</strong> ${submittedData.event.guest_count || '-'}</div>
          </div>
          ${submittedData.selections?.length > 0 ? `
            <p style="margin-top:12px;font-weight:600;font-size:0.813rem;">Selected Menu Items (${submittedData.selections.length})</p>
            <ul style="margin-top:4px;font-size:0.813rem;color:var(--color-gray-700);">
              ${submittedData.selections.slice(0, 10).map(s => `<li>${escapeHtml(s.item_name)}</li>`).join('')}
              ${submittedData.selections.length > 10 ? `<li>...and ${submittedData.selections.length - 10} more</li>` : ''}
            </ul>
          ` : ''}
        </div>
        <button class="btn btn--primary" onclick="location.reload()">Plan Another Event</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <form id="inquiry-form">
      <div class="card" style="margin-bottom:16px;">
        <h3 style="margin-bottom:16px;font-size:1rem;">Event Details</h3>
        <div class="grid grid--2">
          <div class="form-group">
            <label class="form-label" for="inp-name">Your Name *</label>
            <input type="text" id="inp-name" class="form-input" placeholder="Full name" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="inp-mobile">Mobile *</label>
            <input type="tel" id="inp-mobile" class="form-input" placeholder="Phone number" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="inp-email">Email</label>
            <input type="email" id="inp-email" class="form-input" placeholder="Email address">
          </div>
          <div class="form-group">
            <label class="form-label" for="inp-type">Event Type *</label>
            <select id="inp-type" class="form-select">
              <option value="">Select type...</option>
              <option>Wedding</option>
              <option>Engagement</option>
              <option>Birthday</option>
              <option>Corporate</option>
              <option>Reception</option>
              <option>Buffet</option>
              <option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="inp-date">Event Date *</label>
            <input type="date" id="inp-date" class="form-input" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="inp-guests">Expected Guests</label>
            <input type="number" id="inp-guests" class="form-input" placeholder="Number of guests" min="0">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="inp-venue">Venue</label>
          <input type="text" id="inp-venue" class="form-input" placeholder="Event venue / location">
        </div>
        <div class="form-group">
          <label class="form-label" for="inp-notes">Additional Notes</label>
          <textarea id="inp-notes" class="form-textarea" placeholder="Any special requests..."></textarea>
        </div>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <h3 style="margin-bottom:4px;font-size:1rem;">Menu Selection</h3>
        <p style="color:var(--color-gray-500);font-size:0.813rem;margin-bottom:16px;">
          Select the items you'd like at your event. Leave blank if unsure.
        </p>
        <div id="menu-selection">
          ${categories.map(cat => {
            const catItems = items.filter(i => i.category_id === cat.id && i.is_active);

            // Group by sub-category
            const groups = {};
            for (const item of catItems) {
              const sub = item.description && item.description.startsWith('Sub:')
                ? item.description.replace('Sub:', '').trim()
                : null;
              const key = sub || '__main__';
              if (!groups[key]) groups[key] = { sub, items: [] };
              groups[key].items.push(item);
            }

            const groupKeys = Object.keys(groups);

            return `
              <details class="menu-section" ${groupKeys.length <= 3 ? 'open' : ''}>
                <summary class="menu-section-header">
                  <span>${escapeHtml(cat.name)}</span>
                  <span class="menu-section-count">${catItems.length}</span>
                </summary>
                <div class="menu-section-body">
                  ${groupKeys.map(key => {
                    const group = groups[key];
                    return `
                      ${group.sub ? `<p class="menu-sub-label">${escapeHtml(group.sub)}</p>` : ''}
                      <div class="menu-checkbox-grid">
                        ${group.items.map(item => `
                          <label class="menu-checkbox-item">
                            <input type="checkbox" name="menu_item" value="${item.id}">
                            <span>${escapeHtml(item.name)}</span>
                          </label>
                        `).join('')}
                      </div>
                    `;
                  }).join('')}
                </div>
              </details>
            `;
          }).join('')}
        </div>
      </div>

      <button type="submit" class="btn btn--primary btn--block" id="btn-submit" style="padding:14px;font-size:1rem;">
        Submit Inquiry
      </button>
      <p id="inquiry-error" style="color:var(--color-danger);text-align:center;margin-top:12px;display:none;"></p>
    </form>
  `;

  document.getElementById('inquiry-form').addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
  e.preventDefault();
  if (submitting) return;

  const errorEl = document.getElementById('inquiry-error');
  errorEl.style.display = 'none';

  const customer_name = document.getElementById('inp-name').value.trim();
  const mobile = document.getElementById('inp-mobile').value.trim();
  const email = document.getElementById('inp-email').value.trim();
  const event_type = document.getElementById('inp-type').value;
  const event_date = document.getElementById('inp-date').value;
  const guest_count = document.getElementById('inp-guests').value;
  const venue = document.getElementById('inp-venue').value.trim();
  const notes = document.getElementById('inp-notes').value.trim();

  if (!customer_name || !mobile || !event_type || !event_date) {
    showError('Please fill in all required fields (name, mobile, event type, date)');
    return;
  }

  const checkedBoxes = document.querySelectorAll('input[name="menu_item"]:checked');
  const menu_item_ids = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

  submitting = true;
  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const data = await api.post('/public/inquiry', {
      customer_name,
      mobile,
      email,
      event_type,
      event_date,
      guest_count: guest_count ? parseInt(guest_count) : 0,
      venue,
      notes,
      menu_item_ids
    });
    showToast('Inquiry submitted successfully!', 'success');
    renderForm(data);
  } catch (err) {
    showError(err.message || 'Submission failed. Please try again.');
  } finally {
    submitting = false;
    btn.disabled = false;
    btn.textContent = 'Submit Inquiry';
  }
}

function showError(msg) {
  const el = document.getElementById('inquiry-error');
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
