-- Migration 0004: Seed admin and staff users
-- Password for both is "123" (plain text for simplicity during development)

INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES ('Admin', 'admin', '123', 'admin');
INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES ('Staff', 'staff', '123', 'staff');
