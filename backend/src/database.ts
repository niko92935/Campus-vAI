import * as fs from 'fs';
import * as path from 'path';

const { DatabaseSync } = require('node:sqlite');

// data lives at backend/data (dist/main.js -> dist/../data)
const dataDir = path.join(__dirname, '..', 'data');
export const uploadsDir = path.join(dataDir, 'uploads');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'mindlink.db'));

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK(role IN ('student','teacher')),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    rollNumber TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK(status IN ('pending','active','suspended','rejected')),
    idCardFrontPath TEXT NOT NULL,
    idCardBackPath TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    approvedAt TEXT,
    rejectedReason TEXT,
    lastLoginAt TEXT
  );

  CREATE UNIQUE INDEX IF NOT EXISTS users_roll_unique ON users(role, rollNumber, status);

  CREATE TABLE IF NOT EXISTS ota_state (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

/**
 * Approved and pending accounts share the (role, rollNumber) slot.
 * Once a enrollment is rejected the id is freed for a new request.
 */
export function saveUpload(file: { originalname: string; buffer: Buffer }, kind: string): string {
  const ext = (path.extname(file.originalname || '') || '.jpg').toLowerCase().slice(0, 8);
  const filename = `${Date.now()}-${kind}-${Math.random().toString(16).slice(2, 10)}${ext}`;
  fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
  return filename;
}

export function passwordPolicy(pw: string): boolean {
  return typeof pw === 'string' && pw.trim().length >= 6;
}
