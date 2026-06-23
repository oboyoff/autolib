import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'voxmo-dev-secret-change-me';
const JWT_EXPIRES = '24h';

// Rate-limit login : 5 échecs / 15 min par (IP+email), reset sur succès
const RL = { max: 5, windowMs: 15 * 60 * 1000 };
const attempts = new Map(); // key = ip:email → { count, firstAt }
function rlKey(req, email) { return (req.ip || 'unknown') + ':' + String(email || '').toLowerCase(); }
function rlGet(key) { return attempts.get(key); }
function rlReset(key) { attempts.delete(key); }
function rlBump(key) {
  const now = Date.now();
  const cur = attempts.get(key);
  if (!cur || (now - cur.firstAt) > RL.windowMs) {
    attempts.set(key, { count: 1, firstAt: now });
    return { count: 1, blocked: false };
  }
  cur.count += 1;
  return { count: cur.count, blocked: cur.count > RL.max };
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: 'Email et password requis' });

  const key = rlKey(req, email);
  const r = rlGet(key);
  if (r && (Date.now() - r.firstAt) <= RL.windowMs && r.count > RL.max) {
    return res.status(429).json({ ok: false, error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  }

  const user = db.prepare('SELECT id, email, password_hash, role FROM users WHERE email = ?').get(email);
  if (!user) {
    rlBump(key);
    return res.status(401).json({ ok: false, error: 'Identifiants invalides' });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    rlBump(key);
    return res.status(401).json({ ok: false, error: 'Identifiants invalides' });
  }

  rlReset(key);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ ok: true, token, user: { id: user.id, email: user.email, role: user.role } });
});

export default router;
export { JWT_SECRET };
