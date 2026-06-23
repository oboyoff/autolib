#!/usr/bin/env node
/**
 * reseed.js — Drop & re-seed vehicles from schema.js VEHICLES array.
 * Usage: DATABASE_URL="..." node reseed.js
 */
import pg from 'pg';
import { VEHICLES } from './server/db/schema.js';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL env var');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function reseed() {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM vehicles');
    console.log('[reseed] All vehicles deleted');

    for (const v of VEHICLES) {
      await client.query(
        'INSERT INTO vehicles (slug, name, price, category, img, specs, rating, tag) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [v.slug, v.name, v.price, v.category, v.img, v.specs, v.rating, v.tag]
      );
    }
    console.log(`[reseed] ${VEHICLES.length} vehicles inserted`);

    const { rows } = await client.query('SELECT COUNT(*) as n FROM vehicles');
    console.log(`[reseed] Total vehicles in DB: ${rows[0].n}`);
  } finally {
    client.release();
    await pool.end();
  }
}

reseed().catch(e => { console.error(e); process.exit(1); });
