import { router } from '../utils/router.js';

/**
 * Login page (stub for Phase 2).
 */
export async function loginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container" style="max-width:400px;margin-top:80px;">
      <div class="card">
        <h2 style="margin-bottom:24px;text-align:center;">Admin Login</h2>
        <p style="text-align:center;color:var(--color-gray-500);margin-bottom:24px;">
          Sign in to manage your catering business.
        </p>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input type="email" id="email" class="form-input" placeholder="admin@muqeem.com" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input type="password" id="password" class="form-input" placeholder="Enter password" required>
          </div>
          <button type="submit" class="btn btn--primary btn--block">Sign In</button>
        </form>
        <p id="login-error" style="color:var(--color-danger);text-align:center;margin-top:12px;display:none;"></p>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const { api } = await import('../services/api.js');
      await api.post('/auth/login', { email, password });
      window.location.href = '/dashboard';
    } catch (err) {
      errorEl.textContent = err.message || 'Login failed';
      errorEl.style.display = 'block';
    }
  });
}
