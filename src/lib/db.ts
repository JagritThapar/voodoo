import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { createClient, type Client, type InArgs, type Transaction } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";
import { seed } from "./seed";

// Turso (hosted libSQL) when TURSO_DATABASE_URL is set; otherwise a local SQLite file.
const DB_URL = process.env.TURSO_DATABASE_URL ?? `file:${process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "aes.db")}`;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  suburb TEXT,
  state TEXT,
  postcode TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  referral_code TEXT NOT NULL UNIQUE,
  referred_by INTEGER REFERENCES users(id),
  bank_account_name TEXT,
  bank_bsb TEXT,
  bank_account_number TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'requested',
  design TEXT NOT NULL,
  title TEXT NOT NULL,
  estimate_low INTEGER NOT NULL,
  estimate_high INTEGER NOT NULL,
  quote_price INTEGER,
  quote_summary TEXT,
  quote_valid_until TEXT,
  install_date TEXT,
  installer TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

CREATE TABLE IF NOT EXISTS project_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS paperwork (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  owner TEXT NOT NULL DEFAULT 'aes',
  status TEXT NOT NULL DEFAULT 'pending',
  file_name TEXT,
  file_path TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  installer_rating INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referrer_id INTEGER NOT NULL REFERENCES users(id),
  referred_user_id INTEGER UNIQUE REFERENCES users(id),
  name TEXT NOT NULL,
  email TEXT COLLATE NOCASE,
  phone TEXT,
  suburb TEXT,
  interest TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

CREATE TABLE IF NOT EXISTS payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  account_name TEXT NOT NULL,
  bsb TEXT NOT NULL,
  account_number TEXT NOT NULL,
  reference TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT
);

CREATE TABLE IF NOT EXISTS commissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beneficiary_id INTEGER NOT NULL REFERENCES users(id),
  referral_id INTEGER NOT NULL REFERENCES referrals(id),
  level INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payout_id INTEGER REFERENCES payouts(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (referral_id, level)
);
CREATE INDEX IF NOT EXISTS idx_commissions_beneficiary ON commissions(beneficiary_id);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  mime TEXT NOT NULL,
  data BLOB NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL DEFAULT 'news',
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT NOT NULL,
  cta_label TEXT,
  cta_url TEXT,
  expires_at TEXT,
  published_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

declare global {
  // eslint-disable-next-line no-var -- global augmentation requires var
  var __aesDb: Promise<Client> | undefined;
}

async function open(): Promise<Client> {
  if (DB_URL.startsWith("file:")) fs.mkdirSync(path.dirname(DB_URL.slice(5)), { recursive: true });
  const client = createClient({ url: DB_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  if (DB_URL.startsWith("file:")) await client.execute("PRAGMA busy_timeout = 10000");
  await client.executeMultiple(SCHEMA);
  await seed(client);
  return client;
}

// Opened lazily on first query; reused across requests and hot reloads.
function getDb(): Promise<Client> {
  globalThis.__aesDb ??= open().catch((e) => {
    globalThis.__aesDb = undefined;
    throw e;
  });
  return globalThis.__aesDb;
}

// Queries inside tx() run on that transaction.
const currentTx = new AsyncLocalStorage<Transaction>();

export type Param = string | number | bigint | null | Uint8Array | ArrayBuffer;

async function exec(sql: string, params: Param[]) {
  const target = currentTx.getStore() ?? (await getDb());
  const rs = await target.execute({ sql, args: params as InArgs });
  // Plain objects so rows can be passed straight to client components.
  const rows = rs.rows.map((row) => Object.fromEntries(rs.columns.map((c, i) => [c, row[i]])));
  return { rows, changes: rs.rowsAffected, id: Number(rs.lastInsertRowid ?? 0) };
}

export async function one<T>(sql: string, ...params: Param[]): Promise<T | undefined> {
  return (await exec(sql, params)).rows[0] as T | undefined;
}

export async function all<T>(sql: string, ...params: Param[]): Promise<T[]> {
  return (await exec(sql, params)).rows as T[];
}

export async function run(sql: string, ...params: Param[]) {
  const { changes, id } = await exec(sql, params);
  return { changes, id };
}

/** Runs fn in a write transaction; every one/all/run call inside it joins the transaction. */
export async function tx<T>(fn: () => Promise<T>): Promise<T> {
  if (currentTx.getStore()) return fn();
  const t = await (await getDb()).transaction("write");
  try {
    const result = await currentTx.run(t, fn);
    await t.commit();
    return result;
  } catch (e) {
    await t.rollback();
    throw e;
  } finally {
    t.close();
  }
}
