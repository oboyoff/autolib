import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import vehiclesRouter from './server/routes/vehicles.js';
import contactRouter from './server/routes/contact.js';
import reservationsRouter from './server/routes/reservations.js';
import authRouter from './server/routes/auth.js';
import adminRouter from './server/routes/admin.js';
import uploadRouter from './server/routes/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.unsplash.com"],
      fontSrc: ["'self'", "https:", "data:"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '64kb' }));

// Rate limiting global sur les routes publiques sensibles
const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/contact', publicLimiter);
app.use('/api/reservations', publicLimiter);
app.use('/api/auth', publicLimiter);

// API
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin/upload', uploadRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Front statique
app.use(express.static(path.join(__dirname, 'public')));  // /img/vehicles/...
app.use(express.static(__dirname, { extensions: ['html'] })); // index.html, admin.html, etc.

// SPA fallback — toute autre route renvoie index.html
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('[voxmo][ERROR]', err.message);
  res.status(500).json({ ok: false, error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'voxmo-dev-secret-change-me') {
    console.warn('[voxmo][SECURITY] JWT_SECRET absent ou par défaut — configurez une clé forte dans .env en production.');
  }
  console.log(`[voxmo] http://localhost:${PORT}`);
  console.log(`[voxmo] API: /api/health, /api/vehicles, /api/contact, /api/reservations, /api/auth, /api/admin`);
});
