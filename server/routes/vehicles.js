import { Router } from 'express';
import { db } from '../db/db.js';

const router = Router();

// GET /api/vehicles — liste complète (filtre ?active=true par défaut)
router.get('/', (req, res) => {
  const onlyActive = req.query.active !== 'false';
  const query = onlyActive
    ? 'SELECT slug, name, price, category, img, specs, rating, tag FROM vehicles WHERE active = 1 ORDER BY price DESC'
    : 'SELECT slug, name, price, category, img, specs, rating, tag FROM vehicles ORDER BY price DESC';
  const rows = db.prepare(query).all();
  res.json({ ok: true, count: rows.length, vehicles: rows });
});

// GET /api/vehicles/:slug — un véhicule
router.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT slug, name, price, category, img, specs, rating, tag FROM vehicles WHERE slug = ? AND active = 1').get(req.params.slug);
  if (!row) return res.status(404).json({ ok: false, error: 'Véhicule introuvable' });
  res.json({ ok: true, vehicle: row });
});

export default router;
