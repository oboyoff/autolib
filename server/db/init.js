// Init script: crée schéma + seed véhicules + crée admin
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { initSchema, seed } from './schema.js';

initSchema();
seed();

const userCount = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
if (userCount === 0) {
  const hash = bcrypt.hashSync('voxmo2025', 10);
  db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
    .run('admin@voxmo.eu', hash, 'admin');
  console.log('[seed] admin créé: admin@voxmo.eu');
} else {
  console.log(`[seed] ${userCount} user(s) déjà en BDD, skip`);
}

console.log('[init] DB prête à', db.name);
