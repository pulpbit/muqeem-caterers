import { api } from '../services/api.js';
import { router } from '../utils/router.js';

/**
 * Home page.
 * Shows health status and quick links.
 */
export async function homePage() {
  let health = { status: 'unknown', database: 'unknown' };
  try {
    health = await api.health();
  } catch (err) {
    // Service may not be running yet
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Muqeem Caterers</h1>
          <p class="page-subtitle">Complete Catering Business Management System</p>
        </div>
      </div>

      <div class="card" style="text-align:center;padding:48px 24px;margin-bottom:24px;">
        <h2 style="margin-bottom:16px;">Welcome to Muqeem Caterers</h2>
        <p style="color:var(--color-gray-600);margin-bottom:24px;">
          Manage events, menus, quotations, expenses, and more.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <a href="/event-planner" class="btn btn--primary" data-link>Plan an Event</a>
          <a href="/login" class="btn btn--secondary" data-link>Admin Login</a>
        </div>
      </div>

      <div class="grid grid--3">
        <div class="card">
          <h3>API Status</h3>
          <p style="color:var(--color-gray-600);margin-top:8px;">
            Status: <strong style="color:${health.status === 'ok' ? 'var(--color-success)' : 'var(--color-danger)'}">
              ${health.status}
            </strong>
          </p>
          <p style="color:var(--color-gray-600);">
            Database: <strong style="color:${health.database === 'ok' ? 'var(--color-success)' : 'var(--color-danger)'}">
              ${health.database}
            </strong>
          </p>
        </div>
        <div class="card">
          <h3>Quick Actions</h3>
          <ul style="margin-top:8px;list-style:none;">
            <li style="padding:4px 0;">&rarr; Create Event Inquiry</li>
            <li style="padding:4px 0;">&rarr; Manage Menu Items</li>
            <li style="padding:4px 0;">&rarr; Generate Quotation</li>
          </ul>
        </div>
        <div class="card">
          <h3>Today</h3>
          <p style="color:var(--color-gray-600);margin-top:8px;">
            ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  `;

  app.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate(link.getAttribute('href'));
    });
  });
}
