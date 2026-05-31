import { api } from '../services/api.js';
import { showToast } from '../utils/toast.js';
import { authState } from '../utils/authState.js';

let categories = [];
let items = [];
let selectedCategoryId = null;
let editingCategory = null;
let editingItem = null;

export async function menuPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Master Menu</h1>
          <p class="page-subtitle">Manage menu categories and items</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="btn-add-category" class="btn btn--secondary btn--sm">+ Category</button>
          <button id="btn-add-item" class="btn btn--primary btn--sm">+ Item</button>
        </div>
      </div>
      <div id="menu-loading" class="loading-screen" style="min-height:200px;">
        <div class="spinner"></div>
        <p>Loading menu...</p>
      </div>
      <div id="menu-content" style="display:none;">
        <div class="menu-layout">
          <div class="menu-sidebar" id="category-list"></div>
          <div class="menu-main" id="item-list"></div>
        </div>
      </div>
    </div>
    <div id="menu-modal"></div>
  `;

  loadMenu();

  document.getElementById('btn-add-category').addEventListener('click', () => openCategoryModal());
  document.getElementById('btn-add-item').addEventListener('click', () => openItemModal());
}

async function loadMenu() {
  try {
    categories = [];
    items = [];

    const [catData, itemData] = await Promise.all([
      api.get('/menu/categories'),
      api.get('/menu/items')
    ]);

    categories = catData.categories || [];
    items = itemData.items || [];

    document.getElementById('menu-loading').style.display = 'none';
    document.getElementById('menu-content').style.display = 'block';

    if (categories.length > 0) {
      selectedCategoryId = categories[0].id;
    }
    render();
  } catch (err) {
    document.getElementById('menu-loading').innerHTML = `
      <p style="color:var(--color-danger)">Failed to load menu: ${err.message}</p>
      <button class="btn btn--primary" onclick="location.reload()">Retry</button>
    `;
  }
}

function render() {
  renderCategories();
  renderItems();
}

function renderCategories() {
  const container = document.getElementById('category-list');

  const totalItems = items.length;
  const allCount = totalItems;

  container.innerHTML = `
    <div class="menu-category-item ${!selectedCategoryId ? 'active' : ''}"
         data-category-id="">
      <span>All Items</span>
      <span class="menu-category-count">${allCount}</span>
    </div>
  `;

  const allEl = container.querySelector('.menu-category-item');
  allEl.addEventListener('click', () => {
    selectedCategoryId = null;
    render();
  });

  for (const cat of categories) {
    const count = items.filter(i => i.category_id === cat.id).length;
    const isActive = selectedCategoryId === cat.id;
    const div = document.createElement('div');
    div.className = `menu-category-item ${isActive ? 'active' : ''}`;
    div.dataset.categoryId = cat.id;
    div.innerHTML = `
      <span>${cat.name}</span>
      <span class="menu-category-count">${count}</span>
    `;
    container.appendChild(div);

    div.addEventListener('click', () => {
      selectedCategoryId = cat.id;
      render();
    });
  }
}

function renderItems() {
  const container = document.getElementById('item-list');
  const filtered = selectedCategoryId
    ? items.filter(i => i.category_id === selectedCategoryId)
    : items;

  const catName = selectedCategoryId
    ? (categories.find(c => c.id === selectedCategoryId)?.name || 'Items')
    : 'All Items';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:32px;">
        <p style="color:var(--color-gray-500);">No items in this category.</p>
        <button id="btn-add-item-empty" class="btn btn--primary btn--sm" style="margin-top:12px;">+ Add Item</button>
      </div>
    `;
    const btn = document.getElementById('btn-add-item-empty');
    if (btn) btn.addEventListener('click', () => openItemModal());
    return;
  }

  const itemsPerGroup = 20;
  const groups = [];
  for (let i = 0; i < filtered.length; i += itemsPerGroup) {
    groups.push(filtered.slice(i, i + itemsPerGroup));
  }

  container.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">
        <h3 style="font-size:1rem;font-weight:600;">${catName} <span style="font-weight:400;color:var(--color-gray-500);font-size:0.875rem;">(${filtered.length} items)</span></h3>
      </div>
      ${groups.map((group, gi) => `
        <div class="menu-items-group" style="${gi > 0 ? 'border-top:1px solid var(--color-gray-200);padding-top:12px;margin-top:12px;' : ''}">
          ${group.map(item => `
            <div class="menu-item-row ${item.is_active ? '' : 'inactive'}">
              <div class="menu-item-info">
                <span class="menu-item-name">${escapeHtml(item.name)}</span>
                ${item.description ? `<span class="menu-item-desc">${escapeHtml(item.description)}</span>` : ''}
              </div>
              <div class="menu-item-actions">
                <label class="toggle-switch" title="${item.is_active ? 'Disable' : 'Enable'}">
                  <input type="checkbox" ${item.is_active ? 'checked' : ''} data-item-id="${item.id}">
                  <span class="toggle-slider"></span>
                </label>
                <button class="btn btn--sm btn--secondary" data-edit-item="${item.id}" title="Edit">&#9998;</button>
                <button class="btn btn--sm btn--danger" data-delete-item="${item.id}" title="Delete">&times;</button>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', async () => {
      try {
        const result = await api.patch(`/menu/items/${cb.dataset.itemId}/toggle`);
        const idx = items.findIndex(i => i.id === result.item.id);
        if (idx >= 0) items[idx] = result.item;
        renderItems();
        showToast(result.item.is_active ? 'Item enabled' : 'Item disabled', 'info');
      } catch (err) {
        showToast(err.message, 'error');
        cb.checked = !cb.checked;
      }
    });
  });

  container.querySelectorAll('[data-edit-item]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = items.find(i => i.id === Number(btn.dataset.editItem));
      if (item) openItemModal(item);
    });
  });

  container.querySelectorAll('[data-delete-item]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this menu item?')) return;
      try {
        await api.delete(`/menu/items/${btn.dataset.deleteItem}`);
        items = items.filter(i => i.id !== Number(btn.dataset.deleteItem));
        render();
        showToast('Item deleted', 'success');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });
  });
}

function openCategoryModal(category = null) {
  editingCategory = category;
  const isEdit = !!category;
  const modal = document.getElementById('menu-modal');
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal__header">
          <h3 class="modal__title">${isEdit ? 'Edit' : 'Add'} Category</h3>
          <button class="modal__close" id="modal-close">&times;</button>
        </div>
        <div class="modal__body">
          <form id="category-form">
            <div class="form-group">
              <label class="form-label" for="cat-name">Category Name</label>
              <input type="text" id="cat-name" class="form-input" value="${isEdit ? escapeHtml(category.name) : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="cat-order">Display Order</label>
              <input type="number" id="cat-order" class="form-input" value="${isEdit ? category.display_order : categories.length + 1}" min="1">
            </div>
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn--primary" id="modal-save">${isEdit ? 'Update' : 'Create'}</button>
        </div>
        <p id="category-form-error" style="color:var(--color-danger);text-align:center;padding:0 24px 16px;font-size:0.875rem;display:none;"></p>
      </div>
    </div>
  `;

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  });

  document.getElementById('category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('cat-name').value.trim();
    const displayOrder = parseInt(document.getElementById('cat-order').value) || 0;

    if (!name) {
      showError('Category name is required');
      return;
    }

    try {
      if (isEdit) {
        const result = await api.put(`/menu/categories/${category.id}`, { name, display_order: displayOrder });
        const idx = categories.findIndex(c => c.id === category.id);
        if (idx >= 0) categories[idx] = result.category;
        showToast('Category updated', 'success');
      } else {
        const result = await api.post('/menu/categories', { name, display_order: displayOrder });
        categories.push(result.category);
        showToast('Category created', 'success');
      }
      closeModal();
      render();
    } catch (err) {
      showError(err.message);
    }
  });
}

function openItemModal(item = null) {
  editingItem = item;
  const isEdit = !!item;

  const modal = document.getElementById('menu-modal');
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal">
        <div class="modal__header">
          <h3 class="modal__title">${isEdit ? 'Edit' : 'Add'} Menu Item</h3>
          <button class="modal__close" id="modal-close">&times;</button>
        </div>
        <div class="modal__body">
          <form id="item-form">
            <div class="form-group">
              <label class="form-label" for="item-category">Category</label>
              <select id="item-category" class="form-select">
                ${categories.map(c => `
                  <option value="${c.id}" ${(isEdit && item.category_id === c.id) || (!isEdit && c.id === selectedCategoryId) ? 'selected' : ''}>
                    ${escapeHtml(c.name)}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="item-name">Item Name</label>
              <input type="text" id="item-name" class="form-input" value="${isEdit ? escapeHtml(item.name) : ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="item-desc">Description (optional)</label>
              <textarea id="item-desc" class="form-textarea">${isEdit ? escapeHtml(item.description || '') : ''}</textarea>
            </div>
          </form>
        </div>
        <div class="modal__footer">
          <button class="btn btn--secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn--primary" id="modal-save">${isEdit ? 'Update' : 'Create'}</button>
        </div>
        <p id="item-form-error" style="color:var(--color-danger);text-align:center;padding:0 24px 16px;font-size:0.875rem;display:none;"></p>
      </div>
    </div>
  `;

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  });

  document.getElementById('item-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const category_id = parseInt(document.getElementById('item-category').value);
    const name = document.getElementById('item-name').value.trim();
    const description = document.getElementById('item-desc').value.trim();

    if (!name) {
      showItemError('Item name is required');
      return;
    }

    try {
      if (isEdit) {
        const result = await api.put(`/menu/items/${item.id}`, { category_id, name, description });
        const idx = items.findIndex(i => i.id === item.id);
        if (idx >= 0) items[idx] = result.item;
        showToast('Item updated', 'success');
      } else {
        const result = await api.post('/menu/items', { category_id, name, description });
        items.push(result.item);
        showToast('Item created', 'success');
      }
      closeModal();
      render();
    } catch (err) {
      showItemError(err.message);
    }
  });
}

function closeModal() {
  document.getElementById('menu-modal').innerHTML = '';
}

function showError(msg) {
  const el = document.getElementById('category-form-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function showItemError(msg) {
  const el = document.getElementById('item-form-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
