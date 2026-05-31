/**
 * Seed script: Reads package_menu.txt and inserts menu items into D1.
 * Run with: wrangler d1 execute muqeem-db --remote --file=./seeds/seed_menu_items.sql
 * This script generates the SQL file.
 *
 * Mapping logic:
 *   - Non-Veg sections → categories 2 (starter), 4 (main)
 *   - Veg sections → categories 1 (starter), 3 (main)
 *   - Bread sections → category 5
 *   - Dessert/sweet sections → category 6
 *   - Drink sections → category 7
 *   - Misc → category 11 (extra counter)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const txtPath = path.resolve(__dirname, '../../../package_menu.txt');
const outputPath = path.resolve(__dirname, '../migrations/0006_seed_menu_items.sql');

const txt = fs.readFileSync(txtPath, 'utf-8');
const lines = txt.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const SECTION_MAP = {
  // Non-Veg sections
  'NON VEGETARIAN': null, // container
  'STARTERS': { context: {}, cat: null },
  'MAIN COURSE': null, // container
  'MUTTON': { context: { section: 'nonveg_main' }, cat: 4 },
  'CHIKEN': { context: { section: 'nonveg_main' }, cat: 4 },
  'FISH OF PRUNNS': { context: { section: 'nonveg_main' }, cat: 4 },
  'SHORBA': { context: { section: 'nonveg_starter' }, cat: 2 },
  'BIRYANI OF RICE': { context: { section: 'nonveg_main' }, cat: 4 },
  'ROTI KI TOKRI': { context: { section: 'bread' }, cat: 5 },
  'DESERTS': { context: { section: 'sweet' }, cat: 6 },
  'AFTER DINNER': { context: { section: 'sweet' }, cat: 6 },
  'ZAFRAAN SPECIALITY': null, // ambigous, handled per-context
  // Veg sections
  'VEGETARIAN': null,
  'VEG STARTERS': { context: { section: 'veg_starter' }, cat: 1 },
  'MAIN COURSE (VEG)': { context: { section: 'veg_main' }, cat: 3 },
  'DALL KA TADKA': { context: { section: 'veg_main' }, cat: 3 },
  'TAWA': { context: { section: 'veg_main' }, cat: 3 },
  'ROTI KI TOKRI (VEG)': { context: { section: 'bread' }, cat: 5 },
  'RICE': { context: { section: 'veg_main' }, cat: 3 },
  'DESERTS (VEG)': { context: { section: 'sweet' }, cat: 6 }
};

let currentSection = null;
let currentContext = null;
let menuItems = [];
let itemId = 1;

function isSectionHeader(line) {
  return line.startsWith('*') && line.endsWith('*');
}

function normalizeSectionName(name) {
  const n = name.replace(/\*/g, '').trim().toUpperCase();
  // Map non-veg starter
  if (n === 'STARTERS') return 'STARTERS';
  if (n === 'MAIN COURSE') return 'MAIN COURSE';
  if (n === 'MUTTON' || n.includes('MUTTON')) return 'MUTTON';
  if (n === 'CHIKEN' || n.includes('CHIKEN')) return 'CHIKEN';
  if (n.includes('FISH') || n.includes('PRAWNS')) return 'FISH OF PRUNNS';
  if (n.includes('SHORBA') || n.includes('SOUP')) return 'SHORBA';
  if (n.includes('BIRYANI') || n.includes('RICE')) return n.includes('VEG') ? 'RICE' : 'BIRYANI OF RICE';
  if (n.includes('ROTI') || n.includes('NAAN') || n.includes('PARATHA') || n.includes('KULCHA')) {
    if (n.includes('VEG')) return 'ROTI KI TOKRI (VEG)';
    return 'ROTI KI TOKRI';
  }
  if (n === 'DESERTS' || n === 'DESSERTS' || n.includes('SWEET')) return 'DESERTS';
  if (n.includes('AFTER DINNER') || n.includes('RABDI') || n.includes('KULFI') || n.includes('JALEBI')) return 'AFTER DINNER';
  if (n.includes('ZAFRAAN') || n.includes('SPECIALITY')) return 'ZAFRAAN SPECIALITY';
  if (n.includes('VEG STARTER') || n.includes('VEGETARIAN STARTER')) return 'VEG STARTERS';
  if (n === 'MAIN COURSE' || n.includes('VEG MAIN')) {
    // Check context: if we're in VEGETARIAN section, it's veg main
    if (currentContext === 'VEGETARIAN') return 'MAIN COURSE (VEG)';
    return 'MAIN COURSE';
  }
  if (n.includes('DAL') || n.includes('DAAL') || n.includes('DALL') || n.includes('RAJMA')) return 'DALL KA TADKA';
  if (n.includes('TAWA') || n.includes('BHARWA')) return 'TAWA';
  if (n.includes('VEG')) return 'RICE';
  return null;
}

// First pass: identify sections and their context
const sections = [];
let topLevelContext = null;

for (const line of lines) {
  if (isSectionHeader(line)) {
    const name = normalizeSectionName(line);
    if (line.replace(/\*/g, '').trim().toUpperCase() === 'NON VEGETARIAN') {
      topLevelContext = 'NONVEG';
      sections.push({ name: 'NON VEGETARIAN', type: 'context' });
    } else if (line.replace(/\*/g, '').trim().toUpperCase() === 'VEGETARIAN') {
      topLevelContext = 'VEG';
      sections.push({ name: 'VEGETARIAN', type: 'context' });
    } else if (line.replace(/\*/g, '').trim().toUpperCase() === 'OUR PACKAGES') {
      topLevelContext = null;
      sections.push({ name: 'OUR PACKAGES', type: 'ignore' });
    } else if (name && topLevelContext) {
      sections.push({ name, type: 'section', context: topLevelContext });
    }
  }
}

// Build the mapping from section name to category ID
function getCategoryForSection(sectionName, context) {
  const name = sectionName.toUpperCase();
  const isVeg = context === 'VEG';

  if (name.includes('STARTER')) return isVeg ? 1 : 2; // Veg Starter / Non Veg Starter
  if (name.includes('MAIN COURSE') || name.includes('MUTTON') || name.includes('CHIKEN') || name.includes('FISH') || name.includes('PRAWNS') || name.includes('BIRYANI') || name.includes('DAL') || name.includes('TAWA') || name.includes('RICE')) return isVeg ? 3 : 4; // Veg/NonVeg Main Course
  if (name.includes('ROTI') || name.includes('NAAN') || name.includes('PARATHA') || name.includes('KULCHA')) return 5; // Bread
  if (name.includes('DESSERT') || name.includes('SWEET') || name.includes('AFTER DINNER') || name.includes('RABDI') || name.includes('KULFI') || name.includes('JALEBI') || name.includes('HALWA') || name.includes('KHEER') || name.includes('ZARDA')) return 6; // Sweet
  if (name.includes('DRINK') || name.includes('SHORBA') || name.includes('SOUP')) return 7; // Drink
  if (name.includes('SALAD')) return 8; // Salad
  if (name.includes('RAITA')) return 9; // Raita
  if (name.includes('CAFETERIA')) return 10; // Cafeteria
  return 11; // Extra Counter
}

// Second pass: extract items and map to categories
let currentMenuSection = null;
let currentMenuContext = null;
const items = [];
const seen = new Set();

for (const line of lines) {
  if (isSectionHeader(line)) {
    const rawName = line.replace(/\*/g, '').trim().toUpperCase();
    if (rawName === 'NON VEGETARIAN') {
      currentMenuContext = 'NONVEG';
      currentMenuSection = null;
    } else if (rawName === 'VEGETARIAN') {
      currentMenuContext = 'VEG';
      currentMenuSection = null;
    } else if (rawName === 'OUR PACKAGES') {
      currentMenuContext = null;
      currentMenuSection = null;
    } else if (currentMenuContext) {
      currentMenuSection = line.replace(/\*/g, '').trim();
    }
    continue;
  }

  if (!currentMenuContext || !currentMenuSection) continue;

  const itemName = line.replace(/^\*\s*/, '').trim();
  if (!itemName || itemName.startsWith('*') || itemName.length < 2) continue;

  const key = itemName.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);

  const catId = getCategoryForSection(currentMenuSection, currentMenuContext);

  items.push({ name: itemName, category_id: catId });
}

// Generate SQL
let sql = `-- Migration 0006: Seed menu items from package_menu.txt\n`;
sql += `-- Generated by seeds/seed_menu_items.js\n\n`;
sql += `INSERT OR IGNORE INTO menu_items (category_id, name) VALUES\n`;

const valueRows = items.map((item, i) => {
  const escapedName = item.name.replace(/'/g, "''");
  return `(${item.category_id}, '${escapedName}')`;
});

sql += valueRows.join(',\n') + ';\n';

fs.writeFileSync(outputPath, sql, 'utf-8');
console.log(`Generated ${outputPath} with ${items.length} menu items`);
