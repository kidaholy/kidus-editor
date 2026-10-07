import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';
import { UPLOAD_ROOT } from './middleware/upload.js';

/**
 * Build the Express app (no DB connection, no listen call).
 * Used by the local dev server (src/index.js) and by the Vercel function (api/index.js).
 */
export function createApp() {
  const ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());

  const app = express();

  app.use(cors({ origin: (origin, cb) => cb(null, !origin || ORIGINS.includes(origin) || ORIGINS.includes('*')), credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Uploaded thumbnails + CV PDFs
  app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '1d', fallthrough: true }));

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      if (req.originalUrl.startsWith('/api')) {
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
      }
    });
    next();
  });

  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
