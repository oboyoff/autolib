import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../voxmo.db');
const DATABASE_URL = process.env.DATABASE_URL;

let _sqliteDb = null;
let _pgPool = null;
let _type = null;

function getType() {
  if (_type) return _type;
  _type = DATABASE_URL ? 'postgres' : 'sqlite';
  return _type;
}

function getPool() {
  if (DATABASE_URL) {
    if (!_pgPool) {
      _pgPool = new pg.Pool({ connectionString: DATABASE_URL });
    }
    return _pgPool;
  }
  return null;
}

function getSqlite() {
  if (!_sqliteDb) {
    _sqliteDb = new Database(DB_PATH);
    _sqliteDb.pragma('journal_mode = WAL');
    _sqliteDb.pragma('foreign_keys = ON');
  }
  return _sqliteDb;
}

export const db = {
  get type() { return getType(); },
  get instance() { return DATABASE_URL ? getPool() : getSqlite(); },

  async query(sql, params = []) {
    if (DATABASE_URL) {
      let i = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++i}`);
      const res = await getPool().query(pgSql, params);
      return res.rows;
    } else {
      const stmt = getSqlite().prepare(sql);
      return stmt.all(params);
    }
  },

  async exec(sql) {
    if (DATABASE_URL) {
      await getPool().query(sql);
    } else {
      getSqlite().exec(sql);
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
      await getPool().query(pgSql, params);
    } else {
      getSqlite().prepare(sql).run(params);
    }
  }
};
