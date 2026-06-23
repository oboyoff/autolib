import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { initSchema, seed } from './schema.js';

await initSchema();
await seed();

const userRows = await db.query('SELECT COUNT(*) as n FROM users');
const userCount = Number(userRows[0]?.n) || 0;
if (userCount === 0) {
  const hash = bcrypt.hashSync('voxmo2025', 10);
  await db.run(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    ['admin@voxmo.eu', hash, 'admin']
  );
  console.log('[seed] admin cree: admin@voxmo.eu');
} else {
  console.log(`[seed] ${userCount} user(s) deja en BDD, skip`);
}

console.log('[init] DB prete');
process.exit(0);
