/**
 * Local harness: invokes the Vercel serverless handler (api/index.js) as a plain
 * HTTP server so the API test suite can exercise it without deploying.
 * SIM=dest simulates Vercel rewrites that deliver the DESTINATION path
 * (/api/index?orig=...) instead of preserving the original URL.
 */
import http from 'node:http';
import handler from '../api/index.js';

const SIM = process.env.SIM || 'preserve';
const PORT = Number(process.env.PORT) > 0 ? Number(process.env.PORT) : 5001;

const server = http.createServer((req, res) => {
  if (SIM === 'dest') {
    const u = new URL(req.url, 'http://localhost');
    if (u.pathname === '/api' || u.pathname.startsWith('/api/')) {
      req.url = '/api/index?orig=' + u.pathname + (u.search ? '&' + u.search.slice(1) : '');
    } else if (u.pathname.startsWith('/uploads/')) {
      req.url = '/api/index?orig=' + u.pathname + (u.search ? '&' + u.search.slice(1) : '');
    }
  }
  handler(req, res);
});

server.listen(PORT, () => console.log(`[harness] SIM=${SIM} listening on ${PORT}`));
