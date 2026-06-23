#!/usr/bin/env node
/**
 * reseed.js — Drop & re-seed vehicles with new Pinterest image URLs.
 * Usage: DATABASE_URL="..." node reseed.js
 */
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL env var');
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

const VEHICLES = [
  { slug: 'audi-rs6-avant',         name: 'AUDI RS6 AVANT',          price: 440,   category: 'berline',    img: 'https://i.pinimg.com/736x/f5/13/d3/f513d3255b60253edabe547ec0f796d9.jpg', specs: '5 PLACES,AUTO,ESSENCE,QUATTRO',                       rating: 4.9, tag: '★ POPULAIRE' },
  { slug: 'bmw-m5-berline',         name: 'BMW M5 BERLINE',          price: 360,   category: 'berline',    img: 'https://i.pinimg.com/736x/be/9a/69/be9a6927af59743c0b32154029cbd892.jpg', specs: '5 PLACES,AUTO,625CH,CUIR',                             rating: 4.8, tag: '★ POPULAIRE' },
  { slug: 'mercedes-amg-gt-r',      name: 'MERCEDES-AMG GT R',       price: 680,   category: 'premium',    img: 'https://i.pinimg.com/736x/85/d7/67/85d767afc58fb4f66b1c90b06e9bce62.jpg', specs: '2 PLACES,AUTO,585CH,CUIR',                             rating: 4.9, tag: '◆ EXCLUSIVE' },
  { slug: 'porsche-panamera',       name: 'PORSCHE PANAMERA',        price: 460,   category: 'berline',    img: 'https://i.pinimg.com/736x/0a/2a/27/0a2a27483d16d6e33ffcde3590645522.jpg', specs: '4 PLACES,AUTO,630CH,CUIR',                             rating: 4.9, tag: '◆ LUXE' },
  { slug: 'tesla-model-3-mountain', name: 'TESLA MODEL 3 MOUNTAIN',  price: 65,    category: 'electrique', img: 'https://i.pinimg.com/736x/c9/19/56/c91956e9014d4bd27854cfa28ff8b16f.jpg', specs: '5 PLACES,AUTO,100% ÉLEC',                               rating: 4.8, tag: '● ÉLECTRIQUE' },
  { slug: 'tesla-model-3',          name: 'TESLA MODEL 3',           price: 55,    category: 'electrique', img: 'https://i.pinimg.com/736x/58/a2/e2/58a2e20ad3f20f2fba379a1496f8a26f.jpg', specs: '5 PLACES,AUTO,602 KM',                                  rating: 4.8, tag: '● 100% ÉLECTRIQUE' },
  { slug: 'bmw-m4-competition',     name: 'BMW M4 COMPETITION',      price: 400,   category: 'sportive',   img: 'https://i.pinimg.com/736x/06/eb/50/06eb508d2950613f694b0e92e169d1c1.jpg', specs: '4 PLACES,AUTO,510CH,CUIR',                             rating: 4.9, tag: '◆ EXCLUSIVE' },
  { slug: 'ferrari-laferrari',      name: 'FERRARI LAFERRARI',       price: 20000, category: 'premium',    img: 'https://i.pinimg.com/736x/85/78/1c/85781c5edc7c5a30fb420bae24907d22.jpg', specs: '2 PLACES,AUTO,963CH,HYBRIDE',                          rating: 5.0, tag: '◆ SUPERCAR' },
  { slug: 'ferrari-f8-tributo',     name: 'FERRARI F8 TRIBUTO',      price: 1040,  category: 'premium',    img: 'https://i.pinimg.com/736x/22/c3/bd/22c3bd3717da3b5ea7d255f936b0422f.jpg', specs: '2 PLACES,AUTO,720CH,CARBONE',                           rating: 5.0, tag: '◆ SUPERCAR' },
  { slug: 'bmw-m3-competition',     name: 'BMW M3 COMPETITION',      price: 380,   category: 'sportive',   img: 'https://i.pinimg.com/736x/d6/42/b8/d642b8718279ad5944f24ca3382f01a2.jpg', specs: '5 PLACES,AUTO,510CH,CUIR',                             rating: 4.9, tag: '★ POPULAR' },
  { slug: 'bmw-m3-pure',            name: 'BMW M3 PURE',             price: 360,   category: 'sportive',   img: 'https://i.pinimg.com/736x/a0/6c/ba/a06cbaab900be7249028d82e03f41c87.jpg', specs: '5 PLACES,AUTO,480CH,CUIR',                             rating: 4.8, tag: '● SPORT' },
  { slug: 'mercedes-amg-gt-s',      name: 'MERCEDES-AMG GT S',       price: 880,   category: 'sportive',   img: 'https://i.pinimg.com/736x/4a/46/d1/4a46d13ff8c2c640480d8890428a344a.jpg', specs: '2 PLACES,AUTO,522CH,CUIR',                             rating: 4.9, tag: '● NEW' },
  { slug: 'porsche-911-gt3',        name: 'PORSCHE 911 GT3',         price: 600,   category: 'sportive',   img: 'https://i.pinimg.com/736x/12/e4/68/12e4686fd59d9db2c9975798620efed8.jpg', specs: '2 PLACES,AUTO,510CH,CARBONE',                           rating: 5.0, tag: '◆ GT3' },
  { slug: 'bmw-m4-coupe',           name: 'BMW M4 COUPE',            price: 400,   category: 'sportive',   img: 'https://i.pinimg.com/736x/6b/64/91/6b64919bc07cededbfd8d60cbaa8fa85.jpg', specs: '4 PLACES,AUTO,480CH,CUIR',                             rating: 4.9, tag: '★ BEST' },
  { slug: 'mercedes-amg-gt-r-coupe',name: 'MERCEDES-AMG GT R COUPE', price: 680,   category: 'premium',    img: 'https://i.pinimg.com/736x/3f/ef/a3/3fefa3d58f92c7a066fa984bd4590c25.jpg', specs: '2 PLACES,AUTO,585CH,CUIR',                             rating: 4.9, tag: '◆ AMG' },
  { slug: 'bmw-m5-berline-sport',   name: 'BMW M5 BERLINE SPORT',    price: 360,   category: 'berline',    img: 'https://i.pinimg.com/736x/03/ab/00/03ab00de3144d5978a28c99835824d53.jpg', specs: '5 PLACES,AUTO,625CH,CUIR',                             rating: 4.9, tag: '★ BEST-SELLER' },
  { slug: 'audi-rs6-avant-family',  name: 'AUDI RS6 AVANT FAMILY',   price: 440,   category: 'berline',    img: 'https://i.pinimg.com/736x/3a/43/25/3a43252d19fd45ccd265f95c8b915278.jpg', specs: '5 PLACES,AUTO,600CH,QUATTRO',                           rating: 4.9, tag: '● FAMILY' },
  { slug: 'mercedes-amg-gt-r-pro',  name: 'MERCEDES-AMG GT R PRO',   price: 720,   category: 'premium',    img: 'https://i.pinimg.com/736x/63/00/fb/6300fbce7def33d5dcb7c92543a0c3e9.jpg', specs: '2 PLACES,AUTO,585CH,CARBONE',                          rating: 4.9, tag: '◆ AMG BLACK' },
  { slug: 'tesla-model-3-lr',       name: 'TESLA MODEL 3 LONG RANGE',price: 55,    category: 'electrique', img: 'https://i.pinimg.com/736x/37/65/08/37650882bb83e7474f2b8e8a3518c801.jpg', specs: '5 PLACES,AUTO,100% ÉLEC,AUTOPILOT',                    rating: 4.8, tag: '● ELECTRIC' },
  { slug: 'bmw-m3-cs-red',          name: 'BMW M3 CS RED',           price: 400,   category: 'sportive',   img: 'https://i.pinimg.com/736x/cd/1c/fd/cd1cfd58d2fef90cbef7cd78e5560d4f.jpg', specs: '5 PLACES,AUTO,543CH,CARBONE',                          rating: 4.9, tag: '★ TRACK' },
  { slug: 'tesla-model-3-winter',   name: 'TESLA MODEL 3 WINTER',    price: 75,    category: 'electrique', img: 'https://i.pinimg.com/736x/8e/ba/ec/8ebaecfc0ffdde23ce85ddf7488b92a3.jpg', specs: '5 PLACES,AUTO,100% ÉLEC,WINTER',                        rating: 4.8, tag: '● ELECTRIC' },
  { slug: 'mercedes-amg-gt-coupe',  name: 'MERCEDES-AMG GT COUPE',   price: 600,   category: 'premium',    img: 'https://i.pinimg.com/736x/e4/69/cc/e469cc4b7860bb35bf2fc01cfc5ead13.jpg', specs: '2 PLACES,AUTO,557CH,CUIR',                             rating: 4.9, tag: '◆ GT' },
];

async function reseed() {
  const client = await pool.connect();
  try {
    // Delete all existing vehicles
    await client.query('DELETE FROM vehicles');
    console.log('[reseed] All vehicles deleted');

    // Insert new vehicles with Pinterest URLs
    for (const v of VEHICLES) {
      await client.query(
        'INSERT INTO vehicles (slug, name, price, category, img, specs, rating, tag) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [v.slug, v.name, v.price, v.category, v.img, v.specs, v.rating, v.tag]
      );
    }
    console.log(`[reseed] ${VEHICLES.length} vehicles inserted`);

    // Verify
    const { rows } = await client.query('SELECT COUNT(*) as n FROM vehicles');
    console.log(`[reseed] Total vehicles in DB: ${rows[0].n}`);
  } finally {
    client.release();
    await pool.end();
  }
}

reseed().catch(e => { console.error(e); process.exit(1); });
