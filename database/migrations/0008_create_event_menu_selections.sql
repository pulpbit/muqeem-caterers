-- Migration 0008: Create event menu selections table

CREATE TABLE IF NOT EXISTS event_menu_selections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_event_menu_event ON event_menu_selections(event_id);
CREATE INDEX idx_event_menu_item ON event_menu_selections(menu_item_id);
