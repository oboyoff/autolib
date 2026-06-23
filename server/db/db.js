// Database Connection Manager (Hybrid SQLite/PostgreSQL)
import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../voxmo.db');

const DATABASE_URL = process.env.DATABASE_URL;

// Local SQLite instance
const sqliteDb = new Database(DB_PATH);
sqliteDb.pragma('journal_mode = WAL');
sqliteDb.pragma('foreign_keys = ON');

// Cloud PostgreSQL instance
const pgPool = DATABASE_URL ? new pg.Pool({ connectionString: DATABASE_URL }) : null;

export const db = {
  instance: DATABASE_URL ? pgPool : sqliteDb,
  type: DATABASE_URL ? 'postgres' : 'sqlite',

  async query(sql, params = []) {
    if (DATABASE_URL) {
      let i = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++i}`);
      const res = await pgPool.query(pgSql, params);
      return res.rows;
    } else {
      const stmt = sqliteDb.prepare(sql);
      return stmt.all(params);
    }
  },

  async exec(sql) {
    if (DATABASE_URL) {
      await pgPool.query(sql);
    } else {
      sqliteDb.exec(sql);
    }
  },

  async get(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  },

  async run(sql, params = []) {
    if (DATABASE_URL) {
      let i = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++i}`);
      await pgPool.query(pgSql, params);
    } else {
      sqliteDb.prepare(sql).run(params);
    }
  }
};
