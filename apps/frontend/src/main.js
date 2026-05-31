import { router } from './utils/router.js';
import { homePage } from './pages/Home.js';
import { loginPage } from './pages/Login.js';

router
  .add('/', homePage)
  .add('/login', loginPage)
  .add('/event-planner', async () => {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="container"><h1>Event Planner</h1><p>Coming soon in Phase 5.</p></div>';
  })
  .add('/dashboard', async () => {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="container"><h1>Dashboard</h1><p>Coming soon in Phase 14.</p></div>';
  })
  .add('/calendar', async () => {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="container"><h1>Calendar</h1><p>Coming soon in Phase 4.</p></div>';
  })
  .add('/menu', async () => {
    const app = document.getElementById('app');
    app.innerHTML = '<div class="container"><h1>Master Menu</h1><p>Coming soon in Phase 3.</p></div>';
  });

router.resolve();
