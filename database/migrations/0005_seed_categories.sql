-- Migration 0005: Seed default menu categories

INSERT OR IGNORE INTO menu_categories (id, name, display_order) VALUES (1, 'Veg Starter', 1);
INSERT OR IGNORE INTO menu_categories (id, name, display_order) VALUES (2, 'Non Veg Starter', 2);
INSERT OR IGNORE INTO menu_categories (id, name, display_order) VALUES (3, 'Veg Main Course', 3);
INSERT OR IGNORE INTO menu_categories (id, name, display_order) VALUES (4, 'Non Veg Main Course', 4);
INSERT OR IGNORE INTO menu_categories (id, name, display_order) VALUES (5, 'Bread', 5);
INSERT OR IGNORE INTO menu_categories (id, name, display_order) VALUES (6, 'Sweet', 6);
INSERT OR IGNORE INTO menu_categories (id, name, display_order) VALUES (7, 'Drink', 7);
INSERT OR IGNORE INTO menu_categories (id, name, display_order) VALUES (8, 'Salad', 8);
INSERT OR IGNORE INTO menu_categories (id, name, display_order) VALUES (9, 'Raita', 9);
INSERT OR IGNORE INTO menu_categories (id, name, display_order) VALUES (10, 'Cafeteria', 10);
INSERT OR IGNORE INTO menu_categories (id, name, display_order) VALUES (11, 'Extra Counter', 11);
