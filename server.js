import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

// Same origin the app already uses to reach the API (see .env.example) — only the origin is
// needed here since these two routes live at the backend's root, not under /api (see the
// backend's app.js).
const BACKEND_ORIGIN = new URL(process.env.VITE_API_URL || 'http://localhost:5000/api').origin;

const app = express();
app.disable('x-powered-by');

// Carried over from the old public/serve.json (used by the `serve` package this replaces) so
// removing that package doesn't silently drop these headers.
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'index, follow');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  );
  next();
});

// robots.txt/sitemap.xml are generated per-tenant by the backend from the live product/category
// catalog (see backend's controllers/seoController.js) — proxied here rather than duplicated as
// static files in this build so they can't drift out of sync with the catalog.
for (const routePath of ['/robots.txt', '/sitemap.xml']) {
  app.get(routePath, async (req, res) => {
    try {
      const upstream = await fetch(`${BACKEND_ORIGIN}${routePath}`);
      const body = Buffer.from(await upstream.arrayBuffer());
      res.status(upstream.status);
      res.type(upstream.headers.get('content-type') || 'text/plain');
      res.send(body);
    } catch {
      res.status(502).type('text/plain').send('Bad Gateway');
    }
  });
}

app.use(express.static(DIST_DIR));

// SPA fallback: any route not matched above (or on disk) is a client-side route. Express 5's
// router (path-to-regexp v8) requires wildcards to be named — bare '*' throws at startup.
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serving ${DIST_DIR} on port ${PORT}`);
});
