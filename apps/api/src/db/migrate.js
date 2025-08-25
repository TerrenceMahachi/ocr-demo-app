import "dotenv/config";
import { openDB } from "./index.js";

const db = openDB(process.env.DB_PATH || "./data/ocr.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS requests (
    iD INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    dob TEXT,
    file TEXT,
    text TEXT,
    ai_text TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`).run();

console.log("✅ Migration complete");
