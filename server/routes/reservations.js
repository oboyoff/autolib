import { Router } from 'express';
import { db } from '../db/db.js';

const router = Router();

function genBookingId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'VX-';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function isDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }
function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }

const PROMO_CODES = {
  'VOXMO10': { type: 'percent', value: 10 },
  'NEOBRUTAL': { type: 'flat', value: 15 }
};

// POST /api/reservations/validate-promo
router.post('/validate-promo', (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ ok: false, error: 'Code requis' });
  const promo = PROMO_CODES[String(code).toUpperCase().trim()];
  if (!promo) return res.status(400).json({ ok: false, error: 'Code promo invalide' });
  res.json({ ok: true, valid: true, type: promo.type, value: promo.value });
});

// POST /api/reservations
router.post('/', (req, res) => {
  const b = req.body || {};
  const required = ['vehicleSlug', 'startDate', 'endDate', 'pickup', 'dropoff',
    'driverName', 'driverEmail', 'driverPhone', 'driverBirth',
    'driverLicense', 'driverCountry', 'driverLicenseDate', 'driverAddress', 'total'];
  for (const k of required) {
    if (b[k] == null || b[k] === '') return res.status(400).json({ ok: false, error: `Champ requis: ${k}` });
  }
  if (!isDate(b.startDate) || !isDate(b.endDate)) {
    return res.status(400).json({ ok: false, error: 'Dates invalides (YYYY-MM-DD)' });
  }
  if (new Date(b.endDate) <= new Date(b.startDate)) {
    return res.status(400).json({ ok: false, error: 'Date fin doit être après date début' });
  }
  if (!isEmail(b.driverEmail)) return res.status(400).json({ ok: false, error: 'Email invalide' });
  if (typeof b.total !== 'number' || b.total <= 0) return res.status(400).json({ ok: false, error: 'Total invalide' });

  // Vérifier véhicule existe
  const veh = db.prepare('SELECT price FROM vehicles WHERE slug = ? AND active = 1').get(b.vehicleSlug);
  if (!veh) return res.status(404).json({ ok: false, error: 'Véhicule introuvable' });

  // Sécurité : Recalculer le total côté serveur pour éviter les fraudes
  const days = Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / 86400000);
  const basePrice = days * veh.price;
  const crossBorder = b.pickup !== b.dropoff ? 35 : 0;
  
  let optionsFee = 0;
  const opts = Array.isArray(b.options) ? b.options : [];
  for (const opt of opts) {
    if (opt === 'gps') optionsFee += 10;
    else if (opt === 'siege') optionsFee += 15;
    else if (opt === 'assurance') optionsFee += 15 * days;
    else if (opt === 'conducteur') optionsFee += 25;
  }

  const calculatedSubtotal = basePrice + crossBorder + optionsFee;
  let discount = 0;
  if (b.promoCode) {
    const promo = PROMO_CODES[String(b.promoCode).toUpperCase().trim()];
    if (promo) {
      if (promo.type === 'percent') {
        discount = Math.floor((calculatedSubtotal * promo.value) / 100);
      } else if (promo.type === 'flat') {
        discount = promo.value;
      }
    }
  }
  const calculatedTotal = Math.max(0, calculatedSubtotal - discount);

  if (Math.abs(calculatedTotal - b.total) > 1) {
    return res.status(400).json({ 
      ok: false, 
      error: `Fraude ou incohérence de prix détectée. Attendu: ${calculatedTotal}€, Reçu: ${b.total}€` 
    });
  }

  // Vérifier disponibilité (chevauchement de dates)
  const conflict = db.prepare(`
    SELECT id FROM reservations
    WHERE vehicle_slug = ?
      AND status = 'confirmed'
      AND NOT (end_date <= ? OR start_date >= ?)
  `).get(b.vehicleSlug, b.startDate, b.endDate);
  if (conflict) {
    return res.status(409).json({ ok: false, error: 'Véhicule déjà réservé sur ces dates' });
  }

  // Générer bookingId unique
  let bookingId;
  for (let i = 0; i < 5; i++) {
    bookingId = genBookingId();
    const exists = db.prepare('SELECT 1 FROM reservations WHERE booking_id = ?').get(bookingId);
    if (!exists) break;
  }

  const info = db.prepare(`
    INSERT INTO reservations
      (booking_id, vehicle_slug, start_date, end_date, pickup, dropoff,
       driver_name, driver_email, driver_phone, driver_birth, driver_license,
       driver_country, driver_license_date, driver_address, total, status,
       options, promo_code, discount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)
  `).run(
    bookingId, b.vehicleSlug, b.startDate, b.endDate, b.pickup, b.dropoff,
    b.driverName, b.driverEmail, b.driverPhone, b.driverBirth, b.driverLicense,
    b.driverCountry, b.driverLicenseDate, b.driverAddress, b.total,
    JSON.stringify(opts), b.promoCode || null, discount
  );

  res.json({ ok: true, bookingId, id: info.lastInsertRowid });
});

// GET /api/reservations/:bookingId — lecture publique (juste pour vérifier statut)
router.get('/:bookingId', (req, res) => {
  const row = db.prepare(`
    SELECT r.booking_id, r.vehicle_slug, v.name as vehicle_name, r.start_date, r.end_date,
           r.pickup, r.dropoff, r.driver_name, r.total, r.status, r.created_at
    FROM reservations r
    LEFT JOIN vehicles v ON v.slug = r.vehicle_slug
    WHERE r.booking_id = ?
  `).get(req.params.bookingId);
  if (!row) return res.status(404).json({ ok: false, error: 'Réservation introuvable' });
  res.json({ ok: true, reservation: row });
});

export default router;
