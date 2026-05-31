-- Migration 0003: Create events table

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT DEFAULT '',
  event_type TEXT NOT NULL,
  event_date TEXT NOT NULL,
  venue TEXT DEFAULT '',
  guest_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Inquiry' CHECK(status IN (
    'Inquiry', 'Quotation Sent', 'Negotiation', 'Confirmed', 'Completed', 'Cancelled'
  )),
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_code ON events(event_code);
