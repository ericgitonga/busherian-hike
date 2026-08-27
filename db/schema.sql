CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  school TEXT NOT NULL,
  year_left INTEGER NOT NULL,
  guest_count INTEGER NOT NULL,
  next_of_kin_name TEXT NOT NULL,
  next_of_kin_contact TEXT NOT NULL,
  needs_bus INTEGER NOT NULL DEFAULT 0,
  attending_after_party INTEGER NOT NULL DEFAULT 0,
  email TEXT,
  paid INTEGER NOT NULL DEFAULT 0,
  paid_at TEXT,
  checked_in INTEGER NOT NULL DEFAULT 0,
  checked_in_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
