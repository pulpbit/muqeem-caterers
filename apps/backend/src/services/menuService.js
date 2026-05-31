import { NotFoundError, ValidationError } from '../core/errors.js';
import * as categoryRepo from '../repositories/menuCategoryRepository.js';
import * as itemRepo from '../repositories/menuItemRepository.js';

// ─── Categories ───

export async function getAllCategories(c) {
  const { results } = await categoryRepo.findAll(c);
  return results || [];
}

export async function getCategoryById(c, id) {
  id = Number(id);
  const category = await categoryRepo.findById(c, id);
  if (!category) throw new NotFoundError('Category not found');
  return category;
}

export async function createCategory(c, data) {
  return categoryRepo.create(c, data);
}

export async function updateCategory(c, id, data) {
  id = Number(id);
  await getCategoryById(c, id);
  const updated = await categoryRepo.update(c, id, data);
  if (!updated) throw new ValidationError('No changes made');
  return categoryRepo.findById(c, id);
}

export async function deleteCategory(c, id) {
  id = Number(id);
  await getCategoryById(c, id);

  const count = await itemRepo.countByCategory(c, id);
  if (count > 0) {
    throw new ValidationError(`Cannot delete category: ${count} menu items are linked to it. Remove items first.`);
  }

  await categoryRepo.remove(c, id);
  return { message: 'Category deleted' };
}

// ─── Items ───

export async function getAllItems(c, query = {}) {
  const options = {};
  if (query.category_id) options.category_id = Number(query.category_id);
  if (query.active_only === 'true') options.active_only = true;

  const { results } = await itemRepo.findAll(c, options);
  return results || [];
}

export async function getItemById(c, id) {
  id = Number(id);
  const item = await itemRepo.findById(c, id);
  if (!item) throw new NotFoundError('Menu item not found');
  return item;
}

export async function createItem(c, data) {
  const category = await categoryRepo.findById(c, data.category_id);
  if (!category) throw new NotFoundError('Category not found');
  return itemRepo.create(c, data);
}

export async function updateItem(c, id, data) {
  id = Number(id);
  await getItemById(c, id);

  if (data.category_id !== undefined) {
    const category = await categoryRepo.findById(c, data.category_id);
    if (!category) throw new NotFoundError('Category not found');
  }

  const updated = await itemRepo.update(c, id, data);
  if (!updated) throw new ValidationError('No changes made');
  return itemRepo.findById(c, id);
}

export async function deleteItem(c, id) {
  id = Number(id);
  await getItemById(c, id);
  await itemRepo.remove(c, id);
  return { message: 'Menu item deleted' };
}

export async function toggleItemActive(c, id) {
  id = Number(id);
  await getItemById(c, id);
  await itemRepo.toggleActive(c, id);
  return itemRepo.findById(c, id);
}
