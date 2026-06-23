import { Router } from 'express';
import { db } from '../db/db.js';

const router = Router();

function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }

// POST /api/contact
router.post('/', (req, res) => {
  const { name, email, phone, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Champs requis: name, email, message' });
  }
  if (!isEmail(email)) return res.status(400).json({ ok: false, error: 'Email invalide' });
  if (String(message).length > 5000) return res.status(400).json({ ok: false, error: 'Message trop long' });

  const info = db.prepare(
    'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)'
  ).run(String(name).slice(0, 200), String(email).slice(0, 200), phone ? String(phone).slice(0, 50) : null, subject ? String(subject).slice(0, 200) : null, String(message));

  res.json({ ok: true, id: info.lastInsertRowid });
});

export default router;
