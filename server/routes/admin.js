import { Router } from 'express';
import { db } from '../db/db.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Toutes les routes admin sont protégées
router.use(verifyAdmin);

// GET /api/admin/reservations — liste complète avec jointure véhicule
router.get('/reservations', async (req, res) => {
  const rows = await db.query(`
    SELECT r.booking_id, r.vehicle_slug, v.name as vehicle_name,
           r.start_date, r.end_date, r.pickup, r.dropoff,
           r.driver_name, r.driver_email, r.driver_phone, r.total, r.status, r.created_at
    FROM reservations r
    LEFT JOIN vehicles v ON v.slug = r.vehicle_slug
    ORDER BY r.created_at DESC
  `);
  res.json({ ok: true, count: rows.length, reservations: rows });
});

// GET /api/admin/contacts — liste paginée des messages
router.get('/contacts', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  const totalRows = await db.query('SELECT COUNT(*) as n FROM contacts');
  const total = Number(totalRows[0]?.n) || 0;
  const rows = await db.query(`
    SELECT id, name, email, phone, subject, message, created_at
    FROM contacts ORDER BY created_at DESC LIMIT ? OFFSET ?
  `, [limit, offset]);
  res.json({ ok: true, count: rows.length, total, limit, offset, contacts: rows });
});

// POST /api/admin/reservations/:bookingId/cancel
router.post('/reservations/:bookingId/cancel', async (req, res) => {
  await db.query(`UPDATE reservations SET status = 'cancelled' WHERE booking_id = ?`, [req.params.bookingId]);
  res.json({ ok: true, bookingId: req.params.bookingId, status: 'cancelled' });
});

// GET /api/admin/stats — chiffres clés et analytics
router.get('/stats', async (req, res) => {
  const resCount = (await db.query("SELECT COUNT(*) as n, COALESCE(SUM(total),0) as revenue FROM reservations WHERE status='confirmed'"))[0];
  const contactCount = (await db.query('SELECT COUNT(*) as n FROM contacts'))[0];
  const vehCount = (await db.query('SELECT COUNT(*) as n FROM vehicles WHERE active=1'))[0];

  const categoryRevenue = await db.query(`
    SELECT v.category, COUNT(r.id) as count, COALESCE(SUM(r.total), 0) as revenue
    FROM reservations r
    JOIN vehicles v ON v.slug = r.vehicle_slug
    WHERE r.status = 'confirmed'
    GROUP BY v.category
  `);

  const dailyBookings = await db.query(`
    SELECT SUBSTR(r.created_at, 1, 10) as date, COUNT(r.id) as count, COALESCE(SUM(r.total), 0) as revenue
    FROM reservations r
    WHERE r.status = 'confirmed'
    GROUP BY date
    ORDER BY date ASC
    LIMIT 10
  `);

  const allVehicles = await db.query('SELECT slug, name, price, category, img, active, specs, rating, tag FROM vehicles ORDER BY slug ASC');

  res.json({
    ok: true,
    stats: {
      confirmedReservations: resCount?.n || 0,
      revenue: resCount?.revenue || 0,
      contacts: contactCount?.n || 0,
      activeVehicles: vehCount?.n || 0,
      categoryRevenue,
      dailyBookings,
    },
    vehicles: allVehicles
  });
});

// POST /api/admin/vehicles — Ajouter un véhicule
const VALID_CATEGORIES = ['berline', 'suv', 'sportive', 'electrique', 'premium'];

router.post('/vehicles', async (req, res) => {
  const { slug, name, price, category, img, active, specs, rating, tag } = req.body || {};
  if (!slug || !name || !price || !category || !img) {
    return res.status(400).json({ ok: false, error: 'Champs requis : slug, name, price, category, img' });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ ok: false, error: `Catégorie invalide. Valeurs acceptées : ${VALID_CATEGORIES.join(', ')}` });
  }
  if (!/^[a-z0-9-]{2,40}$/.test(String(slug))) {
    return res.status(400).json({ ok: false, error: 'Slug invalide (2-40 chars, a-z, 0-9, tirets uniquement)' });
  }
  try {
    await db.query('INSERT INTO vehicles (slug, name, price, category, img, active, specs, rating, tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [slug, name, Number(price), category, img, (active === 0 || active === false) ? 0 : 1, specs || '', rating || 4.8, tag || '']);
    res.json({ ok: true, slug });
  } catch (e) {
    res.status(400).json({ ok: false, error: 'Ce slug existe déjà ou la requête est invalide' });
  }
});

// PUT /api/admin/vehicles/:slug — Modifier un véhicule
router.put('/vehicles/:slug', async (req, res) => {
  const { name, price, category, img, active, specs, rating, tag } = req.body || {};
  if (!name || !price || !category) {
    return res.status(400).json({ ok: false, error: 'Champs requis : name, price, category' });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ ok: false, error: `Catégorie invalide. Valeurs acceptées : ${VALID_CATEGORIES.join(', ')}` });
  }
  const vehs = await db.query('SELECT img FROM vehicles WHERE slug = ?', [req.params.slug]);
  const existing = vehs[0];
  if (!existing) return res.status(404).json({ ok: false, error: 'Véhicule introuvable' });
  const finalImg = img || existing.img;
  await db.query('UPDATE vehicles SET name = ?, price = ?, category = ?, img = ?, active = ?, specs = ?, rating = ?, tag = ? WHERE slug = ?',
    [name, Number(price), category, finalImg, (active === 0 || active === false) ? 0 : 1, specs || '', rating || 4.8, tag || '', req.params.slug]);
  res.json({ ok: true, slug: req.params.slug });
});

// PATCH /api/admin/vehicles/:slug/toggle — activer/désactiver (soft)
router.patch('/vehicles/:slug/toggle', async (req, res) => {
  const vehs = await db.query('SELECT active FROM vehicles WHERE slug = ?', [req.params.slug]);
  const cur = vehs[0];
  if (!cur) return res.status(404).json({ ok: false, error: 'Véhicule introuvable' });
  const next = cur.active ? 0 : 1;
  await db.query('UPDATE vehicles SET active = ? WHERE slug = ?', [next, req.params.slug]);
  res.json({ ok: true, slug: req.params.slug, active: next });
});

// DELETE /api/admin/vehicles/:slug — suppression définitive
router.delete('/vehicles/:slug', async (req, res) => {
  try {
    await db.query('DELETE FROM vehicles WHERE slug = ?', [req.params.slug]);
    res.json({ ok: true, message: 'Véhicule supprimé' });
  } catch (e) {
    res.status(409).json({ ok: false, error: 'Suppression impossible : véhicule lié à des réservations. Désactivez-le plutôt.' });
  }
});

export default router;
