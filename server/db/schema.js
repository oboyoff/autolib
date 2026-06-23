import { db } from './db.js';

const VEHICLES = [
  { slug: 'audi-rs6-avant',         name: 'AUDI RS6 AVANT',          price: 440,   category: 'berline',    img: 'photo-1606664515524-ed2f786a0bd6', specs: '5 PLACES,AUTO,ESSENCE,QUATTRO',                       rating: 4.9, tag: '★ POPULAIRE' },
  { slug: 'bmw-m5-berline',         name: 'BMW M5 BERLINE',          price: 360,   category: 'berline',    img: 'photo-1555215695-3004980ad54e', specs: '5 PLACES,AUTO,625CH,CUIR',                             rating: 4.8, tag: '★ POPULAIRE' },
  { slug: 'mercedes-amg-gt-r',      name: 'MERCEDES-AMG GT R',       price: 680,   category: 'premium',    img: 'photo-1618843479313-40f8afb4b4d8', specs: '2 PLACES,AUTO,585CH,CUIR',                             rating: 4.9, tag: '◆ EXCLUSIVE' },
  { slug: 'porsche-panamera',       name: 'PORSCHE PANAMERA',        price: 460,   category: 'berline',    img: 'photo-1503376780353-7e6692767b70', specs: '4 PLACES,AUTO,630CH,CUIR',                             rating: 4.9, tag: '◆ LUXE' },
  { slug: 'tesla-model-3-mountain', name: 'TESLA MODEL 3 MOUNTAIN',  price: 65,    category: 'electrique', img: 'photo-1560958089-b8a1929cea89', specs: '5 PLACES,AUTO,100% ÉLEC',                               rating: 4.8, tag: '● ÉLECTRIQUE' },
  { slug: 'tesla-model-3',          name: 'TESLA MODEL 3',           price: 55,    category: 'electrique', img: 'photo-1580273916550-e323be2ae537', specs: '5 PLACES,AUTO,602 KM',                                  rating: 4.8, tag: '● 100% ÉLECTRIQUE' },
  { slug: 'bmw-m4-competition',     name: 'BMW M4 COMPETITION',      price: 400,   category: 'sportive',   img: 'photo-1617531653332-bd46c24f2068', specs: '4 PLACES,AUTO,510CH,CUIR',                             rating: 4.9, tag: '◆ EXCLUSIVE' },
  { slug: 'ferrari-laferrari',      name: 'FERRARI LAFERRARI',       price: 20000, category: 'premium',    img: 'photo-1592198084033-aade902d1aae', specs: '2 PLACES,AUTO,963CH,HYBRIDE',                          rating: 5.0, tag: '◆ SUPERCAR' },
  { slug: 'ferrari-f8-tributo',     name: 'FERRARI F8 TRIBUTO',      price: 1040,  category: 'premium',    img: 'photo-1583121274602-3e2820c69888', specs: '2 PLACES,AUTO,720CH,CARBONE',                           rating: 5.0, tag: '◆ SUPERCAR' },
  { slug: 'bmw-m3-competition',     name: 'BMW M3 COMPETITION',      price: 380,   category: 'sportive',   img: 'photo-1605515298946-d062f2e9da53', specs: '5 PLACES,AUTO,510CH,CUIR',                             rating: 4.9, tag: '★ POPULAR' },
  { slug: 'bmw-m3-pure',            name: 'BMW M3 PURE',             price: 360,   category: 'sportive',   img: 'photo-1605559424843-9e4c228bf1c2', specs: '5 PLACES,AUTO,480CH,CUIR',                             rating: 4.8, tag: '● SPORT' },
  { slug: 'mercedes-amg-gt-s',      name: 'MERCEDES-AMG GT S',       price: 880,   category: 'sportive',   img: 'photo-1621135802920-133df287f89c', specs: '2 PLACES,AUTO,522CH,CUIR',                             rating: 4.9, tag: '● NEW' },
  { slug: 'porsche-911-gt3',        name: 'PORSCHE 911 GT3',         price: 600,   category: 'sportive',   img: 'photo-1614162692292-7ac56d7f7f1e', specs: '2 PLACES,AUTO,510CH,CARBONE',                           rating: 5.0, tag: '◆ GT3' },
  { slug: 'bmw-m4-coupe',           name: 'BMW M4 COUPE',            price: 400,   category: 'sportive',   img: 'photo-1494976388531-d1058494cdd8', specs: '4 PLACES,AUTO,480CH,CUIR',                             rating: 4.9, tag: '★ BEST' },
  { slug: 'mercedes-amg-gt-r-coupe',name: 'MERCEDES-AMG GT R COUPE', price: 680,   category: 'premium',    img: 'photo-1619405399517-d7fce0f13302', specs: '2 PLACES,AUTO,585CH,CUIR',                             rating: 4.9, tag: '◆ AMG' },
  { slug: 'bmw-m5-berline-sport',   name: 'BMW M5 BERLINE SPORT',    price: 360,   category: 'berline',    img: 'photo-1617531653332-bd46c24f2068', specs: '5 PLACES,AUTO,625CH,CUIR',                             rating: 4.9, tag: '★ BEST-SELLER' },
  { slug: 'audi-rs6-avant-family',  name: 'AUDI RS6 AVANT FAMILY',   price: 440,   category: 'berline',    img: 'photo-1606664515524-ed2f786a0bd6', specs: '5 PLACES,AUTO,600CH,QUATTRO',                           rating: 4.9, tag: '● FAMILY' },
  { slug: 'mercedes-amg-gt-r-pro',  name: 'MERCEDES-AMG GT R PRO',   price: 720,   category: 'premium',    img: 'photo-1502877338535-766e1452684a', specs: '2 PLACES,AUTO,585CH,CARBONE',                          rating: 4.9, tag: '◆ AMG BLACK' },
  { slug: 'tesla-model-3-lr',       name: 'TESLA MODEL 3 LONG RANGE',price: 55,    category: 'electrique', img: 'photo-1580273916550-e323be2ae537', specs: '5 PLACES,AUTO,100% ÉLEC,AUTOPILOT',                    rating: 4.8, tag: '● ELECTRIC' },
  { slug: 'bmw-m3-cs-red',          name: 'BMW M3 CS RED',           price: 400,   category: 'sportive',   img: 'photo-1552519507-da3b142c6e3d', specs: '5 PLACES,AUTO,543CH,CARBONE',                          rating: 4.9, tag: '★ TRACK' },
  { slug: 'tesla-model-3-winter',   name: 'TESLA MODEL 3 WINTER',    price: 75,    category: 'electrique', img: 'photo-1560958089-b8a1929cea89', specs: '5 PLACES,AUTO,100% ÉLEC,WINTER',                        rating: 4.8, tag: '● ELECTRIC' },
  { slug: 'mercedes-amg-gt-coupe',  name: 'MERCEDES-AMG GT COUPE',   price: 600,   category: 'premium',    img: 'photo-1619682817481-e994891cd1f5', specs: '2 PLACES,AUTO,557CH,CUIR',                             rating: 4.9, tag: '◆ GT' },
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
