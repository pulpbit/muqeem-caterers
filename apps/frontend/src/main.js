import { router } from './utils/router.js';
import { renderHeader } from './components/Header.js';
import { homePage } from './pages/Home.js';
import { loginPage } from './pages/Login.js';
import { menuPage } from './pages/Menu.js';
import { checkSession } from './services/auth.js';
import { authState } from './utils/authState.js';

/**
 * Check if user is authenticated.
 */
function isAuthenticated() {
  return authState.isLoggedIn;
}

/**
 * Route guard: redirect to login if not authenticated.
 */
function requireAuth(handler) {
  return async (...args) => {
    if (!isAuthenticated()) {
      router.navigate('/login');
      return;
    }
    return handler(...args);
  };
}

router
  .add('/', homePage)
  .add('/login', loginPage)
  .add('/event-planner', async () => {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="container"><h1>Event Planner</h1><p>Coming soon in Phase 5.</p></div>';
  })
  .add('/dashboard', requireAuth(async () => {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="container"><h1>Dashboard</h1><p>Coming soon in Phase 14.</p></div>';
  }))
  .add('/calendar', requireAuth(async () => {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="container"><h1>Calendar</h1><p>Coming soon in Phase 4.</p></div>';
  }))
  .add('/menu', requireAuth(menuPage));

async function init() {
  await checkSession();
  renderHeader();
  router.resolve();
}

init();
