/**
 * Seed script v2: Generates SQL migration for the corrected 4-category menu structure.
 * Run: node apps/backend/seeds/seed_menu_v2.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, '../migrations/0007_seed_menu_v2.sql');

const categories = [
  { id: 1, name: 'NON VEGETARIAN STARTERS', display_order: 1 },
  { id: 2, name: 'NON VEGETARIAN MAIN COURSE', display_order: 2 },
  { id: 3, name: 'VEGETARIAN STARTERS', display_order: 3 },
  { id: 4, name: 'MAIN COURSE', display_order: 4 }
];

const items = [
  // ── Category 1: NON VEGETARIAN STARTERS ──
  { cat: 1, name: 'Kakori Seekh Kabab' },
  { cat: 1, name: 'Nargisi Kofta' },
  { cat: 1, name: 'Cheese Kofta' },
  { cat: 1, name: 'Pasanda Kabab' },
  { cat: 1, name: 'Seek Kalegi' },
  { cat: 1, name: 'Seekh Boti' },
  { cat: 1, name: 'Kulhad Khichda' },
  { cat: 1, name: 'Chiken Tikka' },
  { cat: 1, name: 'Chiken Seekh Kabab' },
  { cat: 1, name: 'Chiken Tangdi Kabab' },
  { cat: 1, name: 'Chiken Barra' },
  { cat: 1, name: 'Afghani Murgh Tikka' },
  { cat: 1, name: 'Hariyali Murgh Tikka' },
  { cat: 1, name: 'Chiken Reshmi Kabab' },
  { cat: 1, name: 'Chiken Malai Tikka' },
  { cat: 1, name: 'Al Baik Chiken' },
  { cat: 1, name: 'Fried Chiken' },
  { cat: 1, name: 'Murgh Tandoori' },
  { cat: 1, name: 'Chiken Spring Roll' },
  { cat: 1, name: 'Chiken Cutlet' },
  { cat: 1, name: 'Fried Mutton Chaap' },
  { cat: 1, name: 'Mutton Barra' },
  { cat: 1, name: 'Fish Amritsari' },
  { cat: 1, name: 'Achari Fish Tikka' },
  { cat: 1, name: 'Fish Tikka' },
  { cat: 1, name: 'Fish Al Baik' },
  { cat: 1, name: 'Fish Fry' },
  { cat: 1, name: 'Fish Finger' },

  // ── Category 2: NON VEGETARIAN MAIN COURSE ──
  // MUTTON
  { cat: 2, name: 'Mutton Qourma', sub: 'MUTTON' },
  { cat: 2, name: 'Mutton Strew', sub: 'MUTTON' },
  { cat: 2, name: 'Mutton Mughlai', sub: 'MUTTON' },
  { cat: 2, name: 'Mutton Rizala', sub: 'MUTTON' },
  { cat: 2, name: 'Mutton Do Pyaza', sub: 'MUTTON' },
  { cat: 2, name: 'Mutton Achari', sub: 'MUTTON' },
  { cat: 2, name: 'Mutton Kadhai', sub: 'MUTTON' },
  { cat: 2, name: 'Mutton Nihari', sub: 'MUTTON' },
  { cat: 2, name: 'Tawa Gosht', sub: 'MUTTON' },
  { cat: 2, name: 'Boti Kabab', sub: 'MUTTON' },
  { cat: 2, name: 'Galawati Kabab', sub: 'MUTTON' },
  { cat: 2, name: 'Mutton Bhuna Gosht', sub: 'MUTTON' },
  { cat: 2, name: 'Moong Gosht', sub: 'MUTTON' },
  { cat: 2, name: 'Chana Gosht', sub: 'MUTTON' },
  // CHIKEN
  { cat: 2, name: 'Murgh Qourma', sub: 'CHIKEN' },
  { cat: 2, name: 'Dum Ka Murgh', sub: 'CHIKEN' },
  { cat: 2, name: 'Murgh Do Pyaza', sub: 'CHIKEN' },
  { cat: 2, name: 'Murgh Mahi Tava', sub: 'CHIKEN' },
  { cat: 2, name: 'Murgh Masala', sub: 'CHIKEN' },
  { cat: 2, name: 'Murgh Kadhai', sub: 'CHIKEN' },
  { cat: 2, name: 'Chiken Tikka Masala', sub: 'CHIKEN' },
  { cat: 2, name: 'Chiken Chilli', sub: 'CHIKEN' },
  { cat: 2, name: 'Murgh Musallam', sub: 'CHIKEN' },
  { cat: 2, name: 'Butter Chiken', sub: 'CHIKEN' },
  { cat: 2, name: 'Chiken Kali Mirch', sub: 'CHIKEN' },
  { cat: 2, name: 'Chiken Rizala', sub: 'CHIKEN' },
  { cat: 2, name: 'Chiken Achari', sub: 'CHIKEN' },
  { cat: 2, name: 'Chiken Changezi', sub: 'CHIKEN' },
  { cat: 2, name: 'Chiken White Qourma', sub: 'CHIKEN' },
  { cat: 2, name: 'Chiken Haleem', sub: 'CHIKEN' },
  // FISH OF PRUNNS
  { cat: 2, name: 'Fish Musallam', sub: 'FISH OF PRUNNS' },
  { cat: 2, name: 'Fish Mahi Tava', sub: 'FISH OF PRUNNS' },
  { cat: 2, name: 'Fish Curry', sub: 'FISH OF PRUNNS' },
  { cat: 2, name: 'Bengali Fish Curry', sub: 'FISH OF PRUNNS' },
  { cat: 2, name: 'Prawns Curry', sub: 'FISH OF PRUNNS' },
  // SHORBA
  { cat: 2, name: 'Chiken Shorba', sub: 'SHORBA' },
  { cat: 2, name: 'Mutton Shorba', sub: 'SHORBA' },
  { cat: 2, name: 'Paya Shorba', sub: 'SHORBA' },
  { cat: 2, name: 'Chiken Lemon Coriander', sub: 'SHORBA' },
  { cat: 2, name: 'Mutton Dhaniya Soup', sub: 'SHORBA' },
  // BIRYANI OF RICE
  { cat: 2, name: 'Lucknowi Mutton Biryani', sub: 'BIRYANI' },
  { cat: 2, name: 'Lucknowi Chiken Biryani', sub: 'BIRYANI' },
  { cat: 2, name: 'Prawns Biryani', sub: 'BIRYANI' },
  { cat: 2, name: 'Fish Biryani', sub: 'BIRYANI' },
  { cat: 2, name: 'Hydrabadi Mutton Biryani', sub: 'BIRYANI' },
  { cat: 2, name: 'Hydrabadi Chiken Biryani', sub: 'BIRYANI' },
  { cat: 2, name: 'Afghani Pulao', sub: 'BIRYANI' },
  // Deserts
  { cat: 2, name: 'Shahi Tukda', sub: 'DESERTS' },
  { cat: 2, name: 'Zafrani Kheer', sub: 'DESERTS' },
  { cat: 2, name: 'Akhrot Kheer', sub: 'DESERTS' },
  { cat: 2, name: 'Gajar Halwa', sub: 'DESERTS' },
  { cat: 2, name: 'Moong Halwa', sub: 'DESERTS' },
  { cat: 2, name: 'Channe Ka Halwa', sub: 'DESERTS' },
  { cat: 2, name: 'Badaam Halwa', sub: 'DESERTS' },
  { cat: 2, name: 'Pineapple Zarda', sub: 'DESERTS' },
  { cat: 2, name: 'Gajar Seb Ki Kheer', sub: 'DESERTS' },
  { cat: 2, name: 'Lauki Halwa', sub: 'DESERTS' },
  { cat: 2, name: 'Zarda', sub: 'DESERTS' },
  // Roti ki Tokri
  { cat: 2, name: 'Sheermal', sub: 'ROTI' },
  { cat: 2, name: 'Ghilafi Kulcha', sub: 'ROTI' },
  { cat: 2, name: 'Dhaniya Roti', sub: 'ROTI' },
  { cat: 2, name: 'Peshawari Naan', sub: 'ROTI' },
  { cat: 2, name: 'Rumali Roti', sub: 'ROTI' },
  { cat: 2, name: 'Mughlai Paratha', sub: 'ROTI' },
  { cat: 2, name: 'Laccha Paratha', sub: 'ROTI' },
  { cat: 2, name: 'Khameeri Roti', sub: 'ROTI' },
  // After Dinner
  { cat: 2, name: 'Rabdi Jalebi', sub: 'AFTER DINNER' },
  { cat: 2, name: 'Imarti Rabdi', sub: 'AFTER DINNER' },
  { cat: 2, name: 'Kesariya Doodh', sub: 'AFTER DINNER' },
  { cat: 2, name: 'Kesariya Makkhan', sub: 'AFTER DINNER' },
  { cat: 2, name: 'Dry Fruit Kulfi', sub: 'AFTER DINNER' },
  { cat: 2, name: 'Kashmiri Chai', sub: 'AFTER DINNER' },
  { cat: 2, name: 'Ras Malai', sub: 'AFTER DINNER' },
  { cat: 2, name: 'Gulab Jammun', sub: 'AFTER DINNER' },
  // ZAFRAAN SPECIALITY (Non-Veg)
  { cat: 2, name: 'Khichda', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Tawa Chaap', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Hyderabadi Haleem', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Bakre Ki Raan', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Bakra Musallam', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Lagan Bater', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Bater Fry', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Bater Musallam', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Tawa Bheja', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Tawa Kaleji', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Qeema Kaju', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Paneer Seekh Kabab', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Afghani Paneer Tikka', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Achari Paneer Tikka', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Paneer Chilli Dry', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'Honey Chilli Potato', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 2, name: 'French Chips', sub: 'ZAFRAAN SPECIALITY' },

  // ── Category 3: VEGETARIAN STARTERS ──
  { cat: 3, name: 'Paneer Seekh Kabab' },
  { cat: 3, name: 'Afghani Paneer Tikka' },
  { cat: 3, name: 'Achari Paneer Tikka' },
  { cat: 3, name: 'Paneer Chilli Dry' },
  { cat: 3, name: 'Honey Chilli Potato' },
  { cat: 3, name: 'French Chips' },
  { cat: 3, name: 'Spring Roll' },
  { cat: 3, name: 'Hara Bhara Kabab' },
  { cat: 3, name: 'Chatpati Chaat (Aloo or Matar)' },
  { cat: 3, name: 'Pyaaz Pakaudi' },
  { cat: 3, name: 'Paani Ke Batashe' },
  { cat: 3, name: 'Hakka Noodles' },
  { cat: 3, name: 'Ried Rice' },
  { cat: 3, name: 'Manchurian Dry' },
  { cat: 3, name: 'Veg Kofta' },
  { cat: 3, name: 'Pizza' },
  { cat: 3, name: 'Dosa' },
  { cat: 3, name: 'Pav Bhaji' },
  { cat: 3, name: 'Soya Chaap' },
  { cat: 3, name: 'Tomato Soup' },
  { cat: 3, name: 'Baby Corn Soup' },
  { cat: 3, name: 'Hot And Sweet Soup' },
  { cat: 3, name: 'Vegatable Soup' },
  { cat: 3, name: 'Mushroom Soup' },
  { cat: 3, name: 'Cream Broccoli Soup' },
  { cat: 3, name: 'Hot Manchuriyan Soup' },

  // ── Category 4: MAIN COURSE ──
  // Main course direct
  { cat: 4, name: 'Shahi Paneer', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Kadhai Paneer', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Palak Paneer', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Paneer Butter Masala', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Matter Paneer', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Paneer Do Pyaaza', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Paneer Bhurji', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Paneer Korma', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Kadhai Vegatable', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Mix Vegetable', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Sarson Ka Saag', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Gobhi Musallam', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Bhindi Do Pyaaza', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Pindi Chola', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Baigan Ka Bharta', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Zeera Aloo', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Paneer Tikka Masala', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Paneer Kali Mirch', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Paneer Masala', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Malai Koft', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Chilli Paneer Gravy', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Veg Manchurian Gravy', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Dum Aloo Masala', sub: 'MAIN COURSE' },
  { cat: 4, name: 'Navratan Qourma', sub: 'MAIN COURSE' },
  // DAAL KA TADKA
  { cat: 4, name: 'Daal Tadka', sub: 'DAAL KA TADKA' },
  { cat: 4, name: 'Daal Fry', sub: 'DAAL KA TADKA' },
  { cat: 4, name: 'Rajma', sub: 'DAAL KA TADKA' },
  { cat: 4, name: 'Daal Makhni', sub: 'DAAL KA TADKA' },
  { cat: 4, name: 'Lauki Ka Daalcha', sub: 'DAAL KA TADKA' },
  { cat: 4, name: 'Pachmela Daal', sub: 'DAAL KA TADKA' },
  { cat: 4, name: 'Kaddu Ka Daalcha', sub: 'DAAL KA TADKA' },
  { cat: 4, name: 'Veg Khichda', sub: 'DAAL KA TADKA' },
  // TAWA
  { cat: 4, name: 'Bharwa Karela', sub: 'TAWA' },
  { cat: 4, name: 'Bharwa Shimla Mirch', sub: 'TAWA' },
  { cat: 4, name: 'Bharwa Parwal', sub: 'TAWA' },
  { cat: 4, name: 'Bhindi Fry', sub: 'TAWA' },
  { cat: 4, name: 'Karela Fry', sub: 'TAWA' },
  { cat: 4, name: 'Tawa Sabzi', sub: 'TAWA' },
  // ROTI KI TOKRI
  { cat: 4, name: 'Mughal Paratha', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Bhatoora', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Aloo Kulcha', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Paneer Kulcha', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Makke KI roti', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Butter Garlic Naan', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Cheese Naan', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Roti Ki Tokri', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Butter Naan', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Plain Naan', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Tandoori Roti', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Butter Roti', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Missi Roti', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Poori', sub: 'ROTI KI TOKRI' },
  { cat: 4, name: 'Rumali roti', sub: 'ROTI KI TOKRI' },
  // RICE
  { cat: 4, name: 'Veg Biryani', sub: 'RICE' },
  { cat: 4, name: 'Veg Pulao', sub: 'RICE' },
  { cat: 4, name: 'Zerra Rice', sub: 'RICE' },
  { cat: 4, name: 'Paneer Pulao', sub: 'RICE' },
  { cat: 4, name: 'Mushroom Biryani', sub: 'RICE' },
  { cat: 4, name: 'Hyderabadi Veg Biryani', sub: 'RICE' },
  { cat: 4, name: 'Mattar Pulao', sub: 'RICE' },
  // AFTER DINNER
  { cat: 4, name: 'Rabdi Jalebi', sub: 'AFTER DINNER' },
  { cat: 4, name: 'Imarti Rabdi', sub: 'AFTER DINNER' },
  { cat: 4, name: 'Kesariya Doodh', sub: 'AFTER DINNER' },
  { cat: 4, name: 'Kesariya Makkhan', sub: 'AFTER DINNER' },
  { cat: 4, name: 'Dry Fuit Kulfi', sub: 'AFTER DINNER' },
  { cat: 4, name: 'Kashmiri Chai', sub: 'AFTER DINNER' },
  { cat: 4, name: 'Ras Malai', sub: 'AFTER DINNER' },
  { cat: 4, name: 'Gulab Jammun', sub: 'AFTER DINNER' },
  // DESERTS
  { cat: 4, name: 'Zafrani Kheer', sub: 'DESERTS' },
  { cat: 4, name: 'Gajar Halwa', sub: 'DESERTS' },
  { cat: 4, name: 'Moong Halwa', sub: 'DESERTS' },
  { cat: 4, name: 'Channe Ka Halwa', sub: 'DESERTS' },
  { cat: 4, name: 'Badaam Halwa', sub: 'DESERTS' },
  { cat: 4, name: 'Gajar Seb Ki Kheer', sub: 'DESERTS' },
  { cat: 4, name: 'Lauki Halwa', sub: 'DESERTS' },
  { cat: 4, name: 'Meetha Dahi Bada', sub: 'DESERTS' },
  // ZAFRAAN SPECIALITY (Veg)
  { cat: 4, name: 'Soya Chaap Biryani', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 4, name: 'Achari Soya Chaap', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 4, name: 'Malai Soya Chaap', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 4, name: 'Veg Galawti Kabab', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 4, name: 'Dimsums', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 4, name: 'Momos', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 4, name: 'Sawted Vegatable', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 4, name: 'Potli Samosa', sub: 'ZAFRAAN SPECIALITY' },
  { cat: 4, name: 'Shorma', sub: 'ZAFRAAN SPECIALITY' }
];

// Deduplicate: skip items with same name in same category
const seen = new Set();
const unique = [];
for (const item of items) {
  const key = `${item.cat}:${item.name.toLowerCase()}`;
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(item);
}

// Generate SQL
let sql = `-- Migration 0007: Restructure menu to 4 categories with sub-categories\n`;
sql += `-- Generated by seeds/seed_menu_v2.js\n\n`;
sql += `-- Clear existing menu data\n`;
sql += `DELETE FROM menu_items;\n`;
sql += `DELETE FROM menu_categories;\n\n`;
sql += `-- Insert categories\n`;
for (const cat of categories) {
  const name = cat.name.replace(/'/g, "''");
  sql += `INSERT INTO menu_categories (id, name, display_order) VALUES (${cat.id}, '${name}', ${cat.display_order});\n`;
}
sql += `\n-- Insert menu items\n`;
for (const item of unique) {
  const name = item.name.replace(/'/g, "''");
  const desc = item.sub ? `'Sub: ${item.sub.replace(/'/g, "''")}'` : "''";
  sql += `INSERT INTO menu_items (category_id, name, description) VALUES (${item.cat}, '${name}', ${desc});\n`;
}

fs.writeFileSync(outputPath, sql, 'utf-8');
console.log(`Generated ${outputPath}`);
console.log(`Categories: ${categories.length}`);
console.log(`Items: ${unique.length}`);
