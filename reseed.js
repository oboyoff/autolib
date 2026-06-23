import { db } from './server/db/db.js';
import { initSchema, seed } from './server/db/schema.js';

await initSchema();

// Delete existing data to force re-seed
await db.run('DELETE FROM reservations');
await db.run('DELETE FROM vehicles');
console.log('[reseed] Reservations et véhicules supprimés');

await seed();
console.log('[reseed] Terminé');
process.exit(0);
