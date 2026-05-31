/**
 * Simple History API router for SPA.
 */
class Router {
  constructor() {
    this.routes = [];
    this.cleanup = null;

    window.addEventListener('popstate', () => this.resolve());
  }

  add(pattern, handler) {
    this.routes.push({ pattern, handler });
    return this;
  }

  navigate(path) {
    history.pushState(null, '', path);
    this.resolve();
  }

  async resolve() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }

    const path = window.location.pathname;

    for (const route of this.routes) {
      const match = this.matchPath(route.pattern, path);
      if (match) {
        document.getElementById('app').innerHTML = '<div class="loading-screen"><div class="spinner"></div><p>Loading...</p></div>';
        const result = route.handler(match.params);
        if (result instanceof Promise) {
          const cleanup = await result;
          if (typeof cleanup === 'function') {
            this.cleanup = cleanup;
          }
        }
        return;
      }
    }

    this.renderNotFound();
  }

  matchPath(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) return null;

    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return { params };
  }

  renderNotFound() {
    document.getElementById('app').innerHTML = `
      <div class="container" style="text-align:center;padding-top:80px;">
        <h1>404</h1>
        <p>Page not found</p>
        <a href="/" class="btn btn--primary" onclick="event.preventDefault(); router.navigate('/')">
          Go Home
        </a>
      </div>
    `;
  }
}

export const router = new Router();
