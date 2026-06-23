import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../routes/auth.js';

// Vérifie header Authorization: Bearer <token>
export function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ ok: false, error: 'Token manquant' });

  try {
    const payload = jwt.verify(m[1], JWT_SECRET);
    if (payload.role !== 'admin') return res.status(403).json({ ok: false, error: 'Accès admin requis' });
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'Token invalide ou expiré' });
  }
}
