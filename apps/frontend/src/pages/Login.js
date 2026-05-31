import { login } from '../services/auth.js';
import { router } from '../utils/router.js';
import { showToast } from '../utils/toast.js';

/**
 * Login page.
 */
export async function loginPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container" style="max-width:400px;margin-top:80px;">
      <div class="card">
        <h2 style="margin-bottom:4px;text-align:center;">Sign In</h2>
        <p style="text-align:center;color:var(--color-gray-500);margin-bottom:24px;font-size:0.875rem;">
          Muqeem Caterers Management
        </p>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input type="text" id="username" class="form-input" placeholder="Enter username" required autocomplete="username" autofocus>
          </div>
          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input type="password" id="password" class="form-input" placeholder="Enter password" required autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn--primary btn--block" id="login-btn">
            Sign In
          </button>
        </form>
        <p id="login-error" style="color:var(--color-danger);text-align:center;margin-top:12px;font-size:0.875rem;display:none;"></p>
      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      errorEl.textContent = 'Please enter username and password';
      errorEl.style.display = 'block';
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

    try {
      await login(username, password);
      showToast('Welcome back!', 'success');
      router.navigate('/dashboard');
    } catch (err) {
      errorEl.textContent = err.message || 'Invalid username or password';
      errorEl.style.display = 'block';
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    }
  });
}
