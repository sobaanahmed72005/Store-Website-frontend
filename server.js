import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

// Same origin the app already uses to reach the API (see .env.example) — only the origin is
// needed here since these two routes live at the backend's root, not under /api (see the
// backend's app.js). Used as a fallback when BACKEND_INTERNAL_URL isn't set (e.g. local dev).
const BACKEND_ORIGIN = new URL(process.env.VITE_API_URL || 'http://localhost:5000/api').origin;

// Railway private-network address for the backend (see Railway dashboard: frontend service's
// BACKEND_INTERNAL_URL var, referencing the backend service's RAILWAY_PRIVATE_DOMAIN + PORT).
const BACKEND_INTERNAL_URL = process.env.BACKEND_INTERNAL_URL || null;

// Only meaningful together with BACKEND_INTERNAL_URL: requireCloudflare (backend's
// middleware/cloudflare.js) rejects any production request without this header, since it's how
// the backend normally proves a request actually came through Cloudflare.
const CLOUDFLARE_SHARED_SECRET = process.env.CLOUDFLARE_SHARED_SECRET || null;

// User-Agent pattern for search engines, social media previews, and AI crawlers
const BOT_USER_AGENT_REGEX =
  /Googlebot|Google-InspectionTool|AdsBot-Google|bingbot|Yahoo! Slurp|DuckDuckBot|Baiduspider|YandexBot|Applebot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|GPTBot|ChatGPT-User|PerplexityBot|ClaudeBot|Google-Extended|anthropic-ai|ia_archiver|archive\.org_bot/i;

const app = express();
app.disable('x-powered-by');

// Carried over from public headers
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

// robots.txt/sitemap.xml/products-feed.xml/llms.txt are generated per-tenant by the backend
for (const routePath of ['/robots.txt', '/sitemap.xml', '/products-feed.xml', '/llms.txt']) {
  app.get(routePath, async (req, res) => {
    try {
      const baseUrl = BACKEND_INTERNAL_URL || BACKEND_ORIGIN;
      const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, '');
      const target = `${cleanBaseUrl}${routePath}`;
      const headers = BACKEND_INTERNAL_URL && CLOUDFLARE_SHARED_SECRET
        ? { 'X-Origin-Shared-Secret': CLOUDFLARE_SHARED_SECRET }
        : {};
      if (req.headers.host) {
        headers['Host'] = req.headers.host;
      }
      const upstream = await fetch(target, { headers });
      const body = Buffer.from(await upstream.arrayBuffer());
      res.status(upstream.status);
      res.type(upstream.headers.get('content-type') || 'text/plain');
      res.send(body);
    } catch {
      res.status(502).type('text/plain').send('Bad Gateway');
    }
  });
}

// Bot Detection & Dynamic Rendering Middleware
app.use(async (req, res, next) => {
  if (req.method !== 'GET') return next();

  const userAgent = req.headers['user-agent'] || '';
  if (!BOT_USER_AGENT_REGEX.test(userAgent)) {
    return next();
  }

  const path = req.path;
  const isPrerenderable =
    path === '/' ||
    path === '/shop' ||
    path.startsWith('/product/') ||
    path.startsWith('/category/') ||
    ['/about-us', '/contact', '/return-exchange', '/privacy-policy'].includes(path);

  if (!isPrerenderable) {
    return next();
  }

  try {
    const encodedPath = encodeURIComponent(req.originalUrl || path);
    const target = BACKEND_INTERNAL_URL
      ? `${BACKEND_INTERNAL_URL}/prerender?path=${encodedPath}`
      : `${BACKEND_ORIGIN}/prerender?path=${encodedPath}`;

    const headers = {};
    if (BACKEND_INTERNAL_URL && CLOUDFLARE_SHARED_SECRET) {
      headers['X-Origin-Shared-Secret'] = CLOUDFLARE_SHARED_SECRET;
    }
    if (req.headers.host) {
      headers['Host'] = req.headers.host;
    }
    if (req.headers['x-forwarded-host']) {
      headers['X-Forwarded-Host'] = req.headers['x-forwarded-host'];
    }
    if (req.headers['x-store-slug']) {
      headers['X-Store-Slug'] = req.headers['x-store-slug'];
    }

    const upstream = await fetch(target, { headers });

    if (upstream.status === 200) {
      const html = await upstream.text();
      res.status(200);
      res.type('text/html; charset=utf-8');
      return res.send(html);
    }

    next();
  } catch (err) {
    console.error('Prerender proxy error:', err.message);
    next();
  }
});

app.use(express.static(DIST_DIR));

// SPA fallback: any route not matched above (or on disk) is a client-side route.
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serving ${DIST_DIR} on port ${PORT}`);
});
