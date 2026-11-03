import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

/**
 * SQLite dùng node:sqlite có sẵn của Node (>= 22.5), file nằm trong volume /app/data trên VPS.
 *
 * Mọi hàm truy cập dữ liệu đều chạy đồng bộ, và API route lẫn socket server chạy chung một process,
 * nên đoạn đọc → sửa → save() của một phòng không bị request khác chen vào (miễn là không có `await` ở giữa).
 */
const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "solo.db");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS puzzles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    difficulty TEXT NOT NULL,
    is_pregenerated INTEGER NOT NULL DEFAULT 0,
    given_cells INTEGER NOT NULL,
    grid TEXT NOT NULL,
    solution TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS puzzles_difficulty ON puzzles (difficulty, is_pregenerated);

  -- players, bàn cờ, nước đi... để dạng JSON trong cột data, vì luôn đọc/ghi nguyên cả phòng
  CREATE TABLE IF NOT EXISTS rooms (
    code TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    data TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS rooms_status ON rooms (status, created_at);

  CREATE TABLE IF NOT EXISTS caro_rooms (
    code TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    data TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS caro_rooms_status ON caro_rooms (status, created_at);

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    stats TEXT NOT NULL,
    game_history TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

// Next nạp mỗi route thành một bundle riêng, nên giữ kết nối ở globalThis để cả process dùng chung một cái.
const store = globalThis as typeof globalThis & { __soloDb?: DatabaseSync };

/** Mở DB ở lần gọi đầu, không mở lúc import để `next build` không đụng tới file DB. */
export function getDb(): DatabaseSync {
  if (!store.__soloDb) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new DatabaseSync(DB_PATH, { timeout: 5000 });
    db.exec("PRAGMA journal_mode = WAL");
    db.exec(SCHEMA);
    store.__soloDb = db;
  }
  return store.__soloDb;
}

export function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}
