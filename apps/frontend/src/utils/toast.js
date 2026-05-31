const TOAST_DURATION = 4000;

/**
 * Show a toast notification.
 * @param {string} message - Message text
 * @param {'success'|'error'|'warning'|'info'} type - Toast type
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = TOAST_DURATION) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="toast__close" aria-label="Close">&times;</button>
  `;

  const closeBtn = toast.querySelector('.toast__close');
  closeBtn.addEventListener('click', () => removeToast(toast));

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }
}

function removeToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(100%)';
  toast.style.transition = 'all 0.3s ease';
  setTimeout(() => toast.remove(), 300);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
