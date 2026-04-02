/**
 * SQLite schema — creates all tables for CCV.
 *
 * Storage location: ~/.ccv/data.db
 */

export const SCHEMA_SQL = `
-- Core mission records
CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  parent_mission_id TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  context_working_directory TEXT NOT NULL DEFAULT '',
  context_target_files TEXT NOT NULL DEFAULT '[]',
  context_constraints TEXT NOT NULL DEFAULT '[]',
  context_model TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
  metrics_total_tokens INTEGER NOT NULL DEFAULT 0,
  metrics_input_tokens INTEGER NOT NULL DEFAULT 0,
  metrics_output_tokens INTEGER NOT NULL DEFAULT 0,
  metrics_total_duration_ms INTEGER NOT NULL DEFAULT 0,
  metrics_task_count INTEGER NOT NULL DEFAULT 0,
  metrics_completed_task_count INTEGER NOT NULL DEFAULT 0,
  metrics_failed_task_count INTEGER NOT NULL DEFAULT 0,
  metrics_estimated_cost_usd REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

-- Stage records
CREATE TABLE IF NOT EXISTS stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TEXT,
  completed_at TEXT,
  output TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_stages_mission ON stages(mission_id);

-- Task records within stages
CREATE TABLE IF NOT EXISTS stage_tasks (
  id TEXT PRIMARY KEY,
  stage_id INTEGER NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  output TEXT NOT NULL DEFAULT '',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_stage_tasks_stage ON stage_tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_tasks_mission ON stage_tasks(mission_id);

-- Team member assignments
CREATE TABLE IF NOT EXISTS team_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  display_name TEXT NOT NULL,
  responsibilities TEXT NOT NULL DEFAULT '[]',
  color TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  current_task TEXT,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_team_assignments_mission ON team_assignments(mission_id);

-- Append-only metrics events for historical charting
CREATE TABLE IF NOT EXISTS metrics_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mission_id TEXT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  total_tokens INTEGER NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER NOT NULL,
  estimated_cost_usd REAL NOT NULL DEFAULT 0,
  recorded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_metrics_log_mission ON metrics_log(mission_id);
CREATE INDEX IF NOT EXISTS idx_metrics_log_time ON metrics_log(recorded_at);

-- Key-value settings store
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS missions_fts USING fts5(
  title,
  description,
  content='missions',
  content_rowid='rowid'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS missions_ai AFTER INSERT ON missions BEGIN
  INSERT INTO missions_fts(rowid, title, description)
  VALUES (new.rowid, new.title, new.description);
END;

CREATE TRIGGER IF NOT EXISTS missions_ad AFTER DELETE ON missions BEGIN
  INSERT INTO missions_fts(missions_fts, rowid, title, description)
  VALUES ('delete', old.rowid, old.title, old.description);
END;

CREATE TRIGGER IF NOT EXISTS missions_au AFTER UPDATE ON missions BEGIN
  INSERT INTO missions_fts(missions_fts, rowid, title, description)
  VALUES ('delete', old.rowid, old.title, old.description);
  INSERT INTO missions_fts(rowid, title, description)
  VALUES (new.rowid, new.title, new.description);
END;
`;
