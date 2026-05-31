-- Migration 0002: Create menu categories and items tables

CREATE TABLE IF NOT EXISTS menu_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

CREATE INDEX idx_menu_items_category ON menu_items(category_id);
