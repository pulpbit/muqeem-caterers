import { router } from '../utils/router.js';
import { authState } from '../utils/authState.js';
import { logout } from '../services/auth.js';

let headerEl = null;

/**
 * Render or update the app header based on auth state.
 */
export function renderHeader() {
  if (!headerEl) {
    headerEl = document.createElement('header');
    headerEl.id = 'app-header';
    headerEl.className = 'header';
    const app = document.getElementById('app');
    app.parentNode.insertBefore(headerEl, app);
  }

  const { isLoggedIn, user } = authState;

  const brandLink = document.createElement('a');
  brandLink.className = 'header__logo';
  brandLink.textContent = 'Muqeem Caterers';
  brandLink.href = '/';

  const nav = document.createElement('nav');
  nav.className = 'header__nav';

  if (isLoggedIn && user) {
    nav.innerHTML = `
      <a href="/dashboard" data-link>Dashboard</a>
      <a href="/calendar" data-link>Calendar</a>
      <a href="/menu" data-link>Menu</a>
      <a href="/quotations" data-link>Quotations</a>
      <span style="font-size:0.813rem;color:var(--color-gray-500);padding:0 4px;">${user.name}</span>
      <button id="btn-logout" class="btn btn--sm btn--secondary">Logout</button>
    `;
  } else {
    nav.innerHTML = `
      <a href="/event-planner" data-link>Plan Event</a>
      <a href="/login" data-link>Login</a>
    `;
  }

  headerEl.innerHTML = '';
  headerEl.appendChild(brandLink);
  headerEl.appendChild(nav);

  headerEl.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate(link.getAttribute('href'));
    });
  });

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logout();
      router.navigate('/login');
    });
  }

  brandLink.addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('/');
  });
}

// Re-render header when auth state changes
authState.subscribe(() => {
  if (headerEl) renderHeader();
});
