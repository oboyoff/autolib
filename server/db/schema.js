import { db } from './db.js';

const VEHICLES = [
  { slug: 'audi-rs6-avant',         name: 'AUDI RS6 AVANT',          price: 440,   category: 'berline',    img: 'https://i.pinimg.com/736x/f5/13/d3/f513d3255b60253edabe547ec0f796d9.jpg', specs: '5 PLACES,AUTO,ESSENCE,QUATTRO',                       rating: 4.9, tag: '★ POPULAIRE' },
  { slug: 'bmw-m5-berline',         name: 'BMW M5 BERLINE',          price: 360,   category: 'berline',    img: 'https://i.pinimg.com/736x/1a/cf/78/1acf789b51906105dadeb20be23f58fe.jpg', specs: '5 PLACES,AUTO,625CH,CUIR',                             rating: 4.8, tag: '★ POPULAIRE' },
  { slug: 'mercedes-amg-gt-r',      name: 'MERCEDES-AMG GT R',       price: 680,   category: 'premium',    img: 'https://i.pinimg.com/736x/b0/98/1f/b0981fbba1e8234e3138256565e5eafc.jpg', specs: '2 PLACES,AUTO,585CH,CUIR',                             rating: 4.9, tag: '◆ EXCLUSIVE' },
  { slug: 'porsche-panamera',       name: 'PORSCHE PANAMERA',        price: 460,   category: 'berline',    img: 'https://i.pinimg.com/736x/4a/05/b4/4a05b45aae41018a4cda0afa32ce0469.jpg', specs: '4 PLACES,AUTO,630CH,CUIR',                             rating: 4.9, tag: '◆ LUXE' },
  { slug: 'tesla-model-3-mountain', name: 'TESLA MODEL 3 MOUNTAIN',  price: 65,    category: 'electrique', img: 'https://i.pinimg.com/736x/c9/19/56/c91956e9014d4bd27854cfa28ff8b16f.jpg', specs: '5 PLACES,AUTO,100% ÉLEC',                               rating: 4.8, tag: '● ÉLECTRIQUE' },
  { slug: 'tesla-model-3',          name: 'TESLA MODEL 3',           price: 55,    category: 'electrique', img: 'https://i.pinimg.com/736x/58/a2/e2/58a2e20ad3f20f2fba379a1496f8a26f.jpg', specs: '5 PLACES,AUTO,602 KM',                                  rating: 4.8, tag: '● 100% ÉLECTRIQUE' },
  { slug: 'bmw-m4-competition',     name: 'BMW M4 COMPETITION',      price: 400,   category: 'sportive',   img: 'https://i.pinimg.com/736x/06/eb/50/06eb508d2950613f694b0e92e169d1c1.jpg', specs: '4 PLACES,AUTO,510CH,CUIR',                             rating: 4.9, tag: '◆ EXCLUSIVE' },
  { slug: 'ferrari-laferrari',      name: 'FERRARI LAFERRARI',       price: 20000, category: 'premium',    img: 'https://i.pinimg.com/736x/70/f0/45/70f0455692470bc89e9b042705f895bd.jpg', specs: '2 PLACES,AUTO,963CH,HYBRIDE',                          rating: 5.0, tag: '◆ SUPERCAR' },
  { slug: 'ferrari-f8-tributo',     name: 'FERRARI F8 TRIBUTO',      price: 1040,  category: 'premium',    img: 'https://i.pinimg.com/736x/17/e8/79/17e879c7c1960e36a783185e4c36c2ba.jpg', specs: '2 PLACES,AUTO,720CH,CARBONE',                           rating: 5.0, tag: '◆ SUPERCAR' },
  { slug: 'bmw-m3-competition',     name: 'BMW M3 COMPETITION',      price: 380,   category: 'sportive',   img: 'https://i.pinimg.com/736x/d6/42/b8/d642b8718279ad5944f24ca3382f01a2.jpg', specs: '5 PLACES,AUTO,510CH,CUIR',                             rating: 4.9, tag: '★ POPULAR' },
  { slug: 'bmw-m3-pure',            name: 'BMW M3 PURE',             price: 360,   category: 'sportive',   img: 'https://i.pinimg.com/736x/2c/ba/70/2cba706e91ee5f81e44fe2495b328ba1.jpg', specs: '5 PLACES,AUTO,480CH,CUIR',                             rating: 4.8, tag: '● SPORT' },
  { slug: 'mercedes-amg-gt-s',      name: 'MERCEDES-AMG GT S',       price: 880,   category: 'sportive',   img: 'https://i.pinimg.com/736x/e3/01/78/e30178b10b0f170a4aebb72566748805.jpg', specs: '2 PLACES,AUTO,522CH,CUIR',                             rating: 4.9, tag: '● NEW' },
  { slug: 'porsche-911-gt3',        name: 'PORSCHE 911 GT3',         price: 600,   category: 'sportive',   img: 'https://i.pinimg.com/736x/12/e4/68/12e4686fd59d9db2c9975798620efed8.jpg', specs: '2 PLACES,AUTO,510CH,CARBONE',                           rating: 5.0, tag: '◆ GT3' },
  { slug: 'bmw-m4-coupe',           name: 'BMW M4 COUPE',            price: 400,   category: 'sportive',   img: 'https://i.pinimg.com/736x/c9/5f/a1/c95fa184d8dbcf94e8dc2ef6ef116431.jpg', specs: '4 PLACES,AUTO,480CH,CUIR',                             rating: 4.9, tag: '★ BEST' },
  { slug: 'mercedes-amg-gt-r-coupe',name: 'MERCEDES-AMG GT R COUPE', price: 680,   category: 'premium',    img: 'https://i.pinimg.com/736x/0a/fd/d8/0afdd80b5c2347058a18dd247e71f8a8.jpg', specs: '2 PLACES,AUTO,585CH,CUIR',                             rating: 4.9, tag: '◆ AMG' },
  { slug: 'bmw-m5-berline-sport',   name: 'BMW M5 BERLINE SPORT',    price: 360,   category: 'berline',    img: 'https://i.pinimg.com/736x/d4/b8/66/d4b86695308c96c21a45ab664a5c0165.jpg', specs: '5 PLACES,AUTO,625CH,CUIR',                             rating: 4.9, tag: '★ BEST-SELLER' },
  { slug: 'audi-rs6-avant-family',  name: 'AUDI RS6 AVANT FAMILY',   price: 440,   category: 'berline',    img: 'https://i.pinimg.com/736x/3a/43/25/3a43252d19fd45ccd265f95c8b915278.jpg', specs: '5 PLACES,AUTO,600CH,QUATTRO',                           rating: 4.9, tag: '● FAMILY' },
  { slug: 'mercedes-amg-gt-r-pro',  name: 'MERCEDES-AMG GT R PRO',   price: 720,   category: 'premium',    img: 'https://i.pinimg.com/736x/4f/76/2b/4f762b4c1bba310acff3b9ed1dcefeab.jpg', specs: '2 PLACES,AUTO,585CH,CARBONE',                          rating: 4.9, tag: '◆ AMG BLACK' },
  { slug: 'tesla-model-3-lr',       name: 'TESLA MODEL 3 LONG RANGE',price: 55,    category: 'electrique', img: 'https://i.pinimg.com/736x/37/65/08/37650882bb83e7474f2b8e8a3518c801.jpg', specs: '5 PLACES,AUTO,100% ÉLEC,AUTOPILOT',                    rating: 4.8, tag: '● ELECTRIC' },
  { slug: 'bmw-m3-cs-red',          name: 'BMW M3 CS RED',           price: 400,   category: 'sportive',   img: 'https://i.pinimg.com/736x/15/e0/4a/15e04aa5ff020ce7bda7f8f07eebacb1.jpg', specs: '5 PLACES,AUTO,543CH,CARBONE',                          rating: 4.9, tag: '★ TRACK' },
  { slug: 'tesla-model-3-winter',   name: 'TESLA MODEL 3 WINTER',    price: 75,    category: 'electrique', img: 'https://i.pinimg.com/736x/8e/ba/ec/8ebaecfc0ffdde23ce85ddf7488b92a3.jpg', specs: '5 PLACES,AUTO,100% ÉLEC,WINTER',                        rating: 4.8, tag: '● ELECTRIC' },
  { slug: 'mercedes-amg-gt-coupe',  name: 'MERCEDES-AMG GT COUPE',   price: 600,   category: 'premium',    img: 'https://i.pinimg.com/736x/3d/0d/31/3d0d3119e39f1512598e78bad45f4d03.jpg', specs: '2 PLACES,AUTO,557CH,CUIR',                             rating: 4.9, tag: '◆ GT' },
];

export async function initSchema() {
  const isPg = db.type === 'postgres';

  if (isPg) {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL,
        category VARCHAR(50) NOT NULL,
        img TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        specs TEXT DEFAULT '',
        rating REAL DEFAULT 4.8,
        tag TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        booking_id VARCHAR(20) UNIQUE NOT NULL,
        vehicle_slug VARCHAR(100) NOT NULL REFERENCES vehicles(slug),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        pickup VARCHAR(100) NOT NULL,
        dropoff VARCHAR(100) NOT NULL,
        driver_name VARCHAR(255) NOT NULL,
        driver_email VARCHAR(255) NOT NULL,
        driver_phone VARCHAR(50) NOT NULL,
        driver_birth DATE NOT NULL,
        driver_license VARCHAR(100) NOT NULL,
        driver_country VARCHAR(10) NOT NULL,
        driver_license_date DATE NOT NULL,
        driver_address TEXT NOT NULL,
        total INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        options TEXT,
        promo_code TEXT,
        discount INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        subject VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.exec(`
      DO $$ BEGIN
        ALTER TABLE reservations ADD COLUMN IF NOT EXISTS options TEXT;
      EXCEPTION WHEN duplicate_column THEN null;
      END $$;
    `);
    await db.exec(`
      DO $$ BEGIN
        ALTER TABLE reservations ADD COLUMN IF NOT EXISTS promo_code TEXT;
      EXCEPTION WHEN duplicate_column THEN null;
      END $$;
    `);
    await db.exec(`
      DO $$ BEGIN
        ALTER TABLE reservations ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0;
      EXCEPTION WHEN duplicate_column THEN null;
      END $$;
    `);
  } else {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        category TEXT NOT NULL,
        img TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        specs TEXT DEFAULT '',
        rating REAL DEFAULT 4.8,
        tag TEXT DEFAULT '',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT UNIQUE NOT NULL,
        vehicle_slug TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        pickup TEXT NOT NULL,
        dropoff TEXT NOT NULL,
        driver_name TEXT NOT NULL,
        driver_email TEXT NOT NULL,
        driver_phone TEXT NOT NULL,
        driver_birth TEXT NOT NULL,
        driver_license TEXT NOT NULL,
        driver_country TEXT NOT NULL,
        driver_license_date TEXT NOT NULL,
        driver_address TEXT NOT NULL,
        total INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'confirmed',
        options TEXT,
        promo_code TEXT,
        discount INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_slug) REFERENCES vehicles(slug)
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try { await db.exec("ALTER TABLE reservations ADD COLUMN options TEXT;"); } catch (e) {}
    try { await db.exec("ALTER TABLE reservations ADD COLUMN promo_code TEXT;"); } catch (e) {}
    try { await db.exec("ALTER TABLE reservations ADD COLUMN discount INTEGER DEFAULT 0;"); } catch (e) {}
    try { await db.exec("ALTER TABLE vehicles ADD COLUMN specs TEXT DEFAULT '';"); } catch (e) {}
    try { await db.exec("ALTER TABLE vehicles ADD COLUMN rating REAL DEFAULT 4.8;"); } catch (e) {}
    try { await db.exec("ALTER TABLE vehicles ADD COLUMN tag TEXT DEFAULT '';"); } catch (e) {}
  }
}

export async function seed() {
  const rows = await db.query('SELECT COUNT(*) as n FROM vehicles');
  const count = Number(rows[0]?.n) || 0;
  if (count === 0) {
    for (const v of VEHICLES) {
      await db.run(
        'INSERT INTO vehicles (slug, name, price, category, img, specs, rating, tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [v.slug, v.name, v.price, v.category, v.img, v.specs, v.rating, v.tag]
      );
    }
    console.log(`[seed] ${VEHICLES.length} vehicules inseres`);
  } else {
    console.log(`[seed] ${count} vehicules deja en BDD, skip`);
  }
}
