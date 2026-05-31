/**
 * Simple reactive auth state store.
 */
class AuthState {
  constructor() {
    this.user = null;
    this.isLoggedIn = false;
    this.listeners = [];
  }

  setUser(user) {
    this.user = user;
    this.isLoggedIn = !!user;
    this.notify();
  }

  clear() {
    this.user = null;
    this.isLoggedIn = false;
    this.notify();
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }
}

export const authState = new AuthState();
