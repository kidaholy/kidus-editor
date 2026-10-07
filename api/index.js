/**
 * Vercel serverless entry — wraps the shared Express app.
 * vercel.json rewrites /api/* and /uploads/* here; everything else is static
 * (client build output) with an SPA fallback to /index.html.
 */
import 'dotenv/config';
import { connectDB } from '../server/src/config/db.js';
import { createApp } from '../server/src/app.js';

// Reuse the Mongo connection across warm invocations of this function instance.
function dbReady() {
  if (!globalThis.__portfolioDbPromise) {
    globalThis.__portfolioDbPromise = connectDB().catch((err) => {
      delete globalThis.__portfolioDbPromise;
      throw err;
    });
  }
  return globalThis.__portfolioDbPromise;
}

let appPromise = null;
function getApp() {
  if (!appPromise) {
    appPromise = dbReady()
      .then(() => createApp())
      .catch((err) => {
        appPromise = null;
        throw err;
      });
  }
  return appPromise;
}

/**
 * Depending on Vercel's rewrite semantics the function may receive either the
 * original path (/api/projects) or the rewrite destination (/index.html? no —
 * /api/index, optionally with the original path in ?orig=...). Normalize so
 * Express always routes on the original URL.
 */
function normalizeUrl(req) {
  const q = req.url.indexOf('?');
  const pathname = q === -1 ? req.url : req.url.slice(0, q);
  const search = q === -1 ? '' : req.url.slice(q + 1);

  if (pathname === '/api/index' || pathname === '/api') {
    const params = new URLSearchParams(search);
    const orig = params.get('orig');
    if (orig) {
      params.delete('orig');
      const rest = params.toString();
      req.url = orig + (rest ? `?${rest}` : '');
    }
    // else: no original path available — Express will 404; diagnosed via logs.
  } else if (pathname.startsWith('/api/index/')) {
    // Destination carrying the path as suffix (fallback form).
    req.url = pathname.slice('/api/index'.length) + (search ? `?${search}` : '');
  }
}

export default function handler(req, res) {
  normalizeUrl(req);
  return getApp().then((app) => app(req, res));
}
