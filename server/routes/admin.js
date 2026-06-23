import { Router } from 'express';
import { db } from '../db/db.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = Router();

// Toutes les routes admin sont protégées
router.use(verifyAdmin);

// GET /api/admin/reservations — liste complète avec jointure véhicule
router.get('/reservations', (req, res) => {
  const rows = db.prepare(`
    SELECT r.booking_id, r.vehicle_slug, v.name as vehicle_name,
           r.start_date, r.end_date, r.pickup, r.dropoff,
           r.driver_name, r.driver_email, r.driver_phone, r.total, r.status, r.created_at
    FROM reservations r
    LEFT JOIN vehicles v ON v.slug = r.vehicle_slug
    ORDER BY r.created_at DESC
  `).all();
  res.json({ ok: true, count: rows.length, reservations: rows });
});

// GET /api/admin/contacts — liste paginée des messages
router.get('/contacts', (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  const total = db.prepare('SELECT COUNT(*) as n FROM contacts').get().n;
  const rows = db.prepare(`
    SELECT id, name, email, phone, subject, message, created_at
    FROM contacts ORDER BY created_at DESC LIMIT ? OFFSET ?
  `).all(limit, offset);
  res.json({ ok: true, count: rows.length, total, limit, offset, contacts: rows });
});

// POST /api/admin/reservations/:bookingId/cancel
router.post('/reservations/:bookingId/cancel', (req, res) => {
  const info = db.prepare(`UPDATE reservations SET status = 'cancelled' WHERE booking_id = ?`).run(req.params.bookingId);
  if (info.changes === 0) return res.status(404).json({ ok: false, error: 'Réservation introuvable' });
  res.json({ ok: true, bookingId: req.params.bookingId, status: 'cancelled' });
});

// GET /api/admin/stats — chiffres clés et analytics
router.get('/stats', (req, res) => {
  const resCount = db.prepare("SELECT COUNT(*) as n, COALESCE(SUM(total),0) as revenue FROM reservations WHERE status='confirmed'").get();
  const contactCount = db.prepare('SELECT COUNT(*) as n FROM contacts').get();
  const vehCount = db.prepare('SELECT COUNT(*) as n FROM vehicles WHERE active=1').get();

  // Chiffre d'affaires par catégorie
  const categoryRevenue = db.prepare(`
    SELECT v.category, COUNT(r.id) as count, COALESCE(SUM(r.total), 0) as revenue
    FROM reservations r
    JOIN vehicles v ON v.slug = r.vehicle_slug
    WHERE r.status = 'confirmed'
    GROUP BY v.category
  `).all();

  // Réservations quotidiennes (les 10 derniers jours d'activité)
  const dailyBookings = db.prepare(`
    SELECT SUBSTR(r.created_at, 1, 10) as date, COUNT(r.id) as count, COALESCE(SUM(r.total), 0) as revenue
    FROM reservations r
    WHERE r.status = 'confirmed'
    GROUP BY date
    ORDER BY date ASC
    LIMIT 10
  `).all();

  // Liste complète des véhicules pour le CRUD admin
  const allVehicles = db.prepare('SELECT slug, name, price, category, img, active, specs, rating, tag FROM vehicles ORDER BY slug ASC').all();

  res.json({
    ok: true,
    stats: {
      confirmedReservations: resCount.n,
      revenue: resCount.revenue,
      contacts: contactCount.n,
      activeVehicles: vehCount.n,
      categoryRevenue,
      dailyBookings,
    },
    vehicles: allVehicles
  });
});

// POST /api/admin/vehicles — Ajouter un véhicule
const VALID_CATEGORIES = ['berline', 'suv', 'sportive', 'electrique', 'premium'];

router.post('/vehicles', (req, res) => {
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
    db.prepare('INSERT INTO vehicles (slug, name, price, category, img, active, specs, rating, tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(slug, name, Number(price), category, img, (active === 0 || active === false) ? 0 : 1, specs || '', rating || 4.8, tag || '');
    res.json({ ok: true, slug });
  } catch (e) {
    res.status(400).json({ ok: false, error: 'Ce slug existe déjà ou la requête est invalide' });
  }
});

// PUT /api/admin/vehicles/:slug — Modifier un véhicule
router.put('/vehicles/:slug', (req, res) => {
  const { name, price, category, img, active, specs, rating, tag } = req.body || {};
  if (!name || !price || !category) {
    return res.status(400).json({ ok: false, error: 'Champs requis : name, price, category' });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ ok: false, error: `Catégorie invalide. Valeurs acceptées : ${VALID_CATEGORIES.join(', ')}` });
  }
  const existing = db.prepare('SELECT img FROM vehicles WHERE slug = ?').get(req.params.slug);
  if (!existing) return res.status(404).json({ ok: false, error: 'Véhicule introuvable' });
  const finalImg = img || existing.img;
  const info = db.prepare('UPDATE vehicles SET name = ?, price = ?, category = ?, img = ?, active = ?, specs = ?, rating = ?, tag = ? WHERE slug = ?')
    .run(name, Number(price), category, finalImg, (active === 0 || active === false) ? 0 : 1, specs || '', rating || 4.8, tag || '', req.params.slug);
  res.json({ ok: true, slug: req.params.slug });
});

// PATCH /api/admin/vehicles/:slug/toggle — activer/désactiver (soft)
router.patch('/vehicles/:slug/toggle', (req, res) => {
  const cur = db.prepare('SELECT active FROM vehicles WHERE slug = ?').get(req.params.slug);
  if (!cur) return res.status(404).json({ ok: false, error: 'Véhicule introuvable' });
  const next = cur.active ? 0 : 1;
  db.prepare('UPDATE vehicles SET active = ? WHERE slug = ?').run(next, req.params.slug);
  res.json({ ok: true, slug: req.params.slug, active: next });
});

// DELETE /api/admin/vehicles/:slug — suppression définitive
router.delete('/vehicles/:slug', (req, res) => {
  try {
    const info = db.prepare('DELETE FROM vehicles WHERE slug = ?').run(req.params.slug);
    if (info.changes === 0) return res.status(404).json({ ok: false, error: 'Véhicule introuvable' });
    res.json({ ok: true, message: 'Véhicule supprimé' });
  } catch (e) {
    res.status(409).json({ ok: false, error: 'Suppression impossible : véhicule lié à des réservations. Désactivez-le plutôt.' });
  }
});

export default router;
