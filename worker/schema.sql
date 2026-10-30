-- One row per corrected cell. The page's built-in tables are the defaults;
-- a row here replaces one value for every viewer. Deleting the row restores the default.
CREATE TABLE IF NOT EXISTS edits (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
