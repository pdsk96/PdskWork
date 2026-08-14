-- PdskWork database schema
-- Iteration 1 scaffolding. Targets SQLite (portable) but uses portable types
-- so it can be lifted to Postgres in later iterations without major rework.

PRAGMA foreign_keys = ON;

-- Admin accounts (the cookie-based session is separate; this is for future
-- multi-user admin). Keeping it minimal but present so later iterations do not
-- need to alter the auth surface.
CREATE TABLE IF NOT EXISTS admin_users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT    NOT NULL UNIQUE,
  password_hash TEXT  NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Portfolio / work items.
CREATE TABLE IF NOT EXISTS work_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT    NOT NULL UNIQUE,
  title       TEXT    NOT NULL,
  summary     TEXT    NOT NULL,
  cover_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  published   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Localized content for work items (en / id).
CREATE TABLE IF NOT EXISTS work_item_translations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  work_item_id  INTEGER NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
  locale        TEXT    NOT NULL CHECK (locale IN ('en', 'id')),
  title         TEXT,
  summary       TEXT,
  body          TEXT,
  UNIQUE (work_item_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_work_items_published ON work_items(published, sort_order);
CREATE INDEX IF NOT EXISTS idx_translations_locale ON work_item_translations(work_item_id, locale);
