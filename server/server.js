import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import vehiclesRouter from './routes/vehicles.js';
import contactRouter from './routes/contact.js';
import reservationsRouter from './routes/reservations.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import uploadRouter from './routes/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.unsplash.com", "https://i.pinimg.com"],
      fontSrc: ["'self'", "https:", "data:"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://wa.me"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
    }
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '64kb' }));

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/contact', publicLimiter);
app.use('/api/reservations', publicLimiter);
app.use('/api/auth', publicLimiter);

app.use('/api/vehicles', vehiclesRouter);
app.use('/api/contact', contactRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin/upload', uploadRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

const rootDir = path.resolve(__dirname, '..');
app.use('/img', express.static(path.join(rootDir, 'public/img')));
app.use(express.static(rootDir, { extensions: ['html'] }));

app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('[voxmo][ERROR]', err.message);
  res.status(500).json({ ok: false, error: 'Erreur interne du serveur' });
});

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'voxmo-dev-secret-change-me') {
      console.warn('[voxmo][SECURITY] JWT_SECRET absent ou par defaut');
    }
    console.log(`[voxmo] http://localhost:${PORT}`);
  });
}

export default app;
