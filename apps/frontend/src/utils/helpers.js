/**
 * Render a template string into a container element.
 * @param {HTMLElement|string} container - Container element or selector
 * @param {string} template - HTML string
 */
export function render(container, template) {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;
  if (el) el.innerHTML = template;
}

/**
 * Format date to locale string.
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format currency (Indian Rupees).
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

/**
 * Debounce a function.
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
