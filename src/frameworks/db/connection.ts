/**
 * SQLite connection manager.
 *
 * Creates/opens the database at ~/.ccv/data.db and runs schema migrations.
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { SCHEMA_SQL } from './schema';

let db: Database.Database | null = null;

export function getDbPath(): string {
  return join(homedir(), '.ccv', 'data.db');
}

export function getDb(): Database.Database {
  if (db) return db;

  const ccvDir = join(homedir(), '.ccv');
  if (!existsSync(ccvDir)) {
    mkdirSync(ccvDir, { recursive: true });
  }

  const dbPath = getDbPath();
  db = new Database(dbPath);

  // Performance pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  // Run schema
  db.exec(SCHEMA_SQL);

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
