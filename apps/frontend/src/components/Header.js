import { router } from '../utils/router.js';

/**
 * Render the app header.
 * @param {{ isLoggedIn: boolean, user: object|null }} state
 */
export function renderHeader(state) {
  const header = document.getElementById('app-header');

  if (!header) {
    const app = document.getElementById('app');
    const headerEl = document.createElement('header');
    headerEl.id = 'app-header';
    headerEl.className = 'header';
    app.parentNode.insertBefore(headerEl, app);
  }

  const headerEl = document.getElementById('app-header');

  const navLinks = state.isLoggedIn
    ? `
      <a href="/dashboard" data-link>Dashboard</a>
      <a href="/calendar" data-link>Calendar</a>
      <a href="/menu" data-link>Menu</a>
      <button id="btn-logout">Logout</button>
    `
    : `
      <a href="/login" data-link>Login</a>
      <a href="/event-planner" data-link>Plan Event</a>
    `;

  headerEl.innerHTML = `
    <a href="/" class="header__logo" data-link>Muqeem Caterers</a>
    <nav class="header__nav">
      ${navLinks}
    </nav>
  `;

  headerEl.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate(link.getAttribute('href'));
    });
  });

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const { api } = await import('../services/api.js');
        await api.post('/auth/logout');
        window.location.href = '/login';
      } catch (err) {
        window.location.href = '/login';
      }
    });
  }
}
