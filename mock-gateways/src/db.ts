import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../mock_gateways.sqlite');

export const db = new DatabaseSync(dbPath);

export function initDatabase() {
  // 1. Google OAuth Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS google_users (
      google_id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      given_name TEXT,
      family_name TEXT,
      picture TEXT
    );

    CREATE TABLE IF NOT EXISTS auth_codes (
      code TEXT PRIMARY KEY,
      google_id TEXT NOT NULL,
      client_id TEXT NOT NULL,
      redirect_uri TEXT NOT NULL,
      scope TEXT,
      consumed INTEGER NOT NULL DEFAULT 0,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS access_tokens (
      token TEXT PRIMARY KEY,
      google_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );

    -- 2. bKash Payments Table
    CREATE TABLE IF NOT EXISTS bkash_payments (
      payment_id TEXT PRIMARY KEY,
      order_external TEXT,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BDT',
      status TEXT NOT NULL DEFAULT 'pending',
      trx_id TEXT,
      success_url TEXT,
      cancel_url TEXT,
      created_at INTEGER NOT NULL
    );

    -- 3. Nagad Payments Table
    CREATE TABLE IF NOT EXISTS nagad_payments (
      payment_ref_id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BDT',
      status TEXT NOT NULL DEFAULT 'pending',
      trx_id TEXT,
      callback_url TEXT,
      challenge TEXT,
      created_at INTEGER NOT NULL
    );

    -- 4. SSLCommerz Sessions Table
    CREATE TABLE IF NOT EXISTS sslcommerz_sessions (
      session_id TEXT PRIMARY KEY,
      tran_id TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'BDT',
      status TEXT NOT NULL DEFAULT 'pending',
      success_url TEXT,
      fail_url TEXT,
      cancel_url TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  // Seed default demo Google users if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM google_users');
  const result = countStmt.get() as { count: number };
  if (result.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO google_users (google_id, email, name, given_name, family_name, picture)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'google_usr_1001',
      'sakib.hasan@gmail.com',
      'Sakib Al Hasan',
      'Sakib',
      'Hasan',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Sakib'
    );

    insertUser.run(
      'google_usr_1002',
      'ayesha.rahman@gmail.com',
      'Ayesha Rahman',
      'Ayesha',
      'Rahman',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Ayesha'
    );

    insertUser.run(
      'google_usr_1003',
      'tanvir.ahmed@gmail.com',
      'Tanvir Ahmed',
      'Tanvir',
      'Ahmed',
      'https://api.dicebear.com/7.x/avataaars/png?seed=Tanvir'
    );
  }
}
