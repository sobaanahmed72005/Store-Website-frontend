# Deployment Checklist

Everything to do before, during, and right after taking this store live. Check items off as you go. Grouped by when it needs to happen.

**Repo layout note:** frontend and backend are two separate GitHub repos (not one monorepo with a `backend/` subfolder, despite some earlier drafts of this doc assuming that). Below, "the backend repo" and paths like `config/db.js` refer to files in the backend repo; this file itself lives in the frontend repo.

---

## 0. Hosting setup — Railway (app) + PKNIC (domain, already owned) + Cloudflare (DNS) + Namecheap (email only)

Decided setup: the domain is already registered separately at **PKNIC** (not Namecheap) — that registration doesn't change. The actual app (frontend, backend, and database) all runs on **Railway** (Hobby plan, $5/mo, usage-based beyond that). Railway doesn't offer mailbox/email hosting, so a mailbox is set up at **Namecheap** (its email-only "Private Email" product, not their web hosting) purely for sending order/verification emails and receiving customer replies.

**DNS note:** confirmed PKNIC's panel only exposes a "Nameservers" field (currently blank/unset) — it has no built-in DNS record editor (no CNAME/TXT/MX management). So DNS is delegated to **Cloudflare (free plan)**: Cloudflare becomes the nameserver for the domain, and all records (Railway's CNAME/TXT for the app, Namecheap's MX for mail) are added inside Cloudflare, not at PKNIC or Namecheap. This is step 1 below because nameserver propagation can take up to 24-48 hours for `.pk` domains — start it first so it's ready by the time everything else is set up.

- [ ] **Step 1 — Delegate DNS to Cloudflare (do this first, it's slow to propagate):**
  1. Sign up free at cloudflare.com → "Add a Site" → enter the domain.
  2. Choose the **Free** plan. Let it scan for existing records (likely none, since PKNIC nameservers are unset).
  3. Cloudflare assigns two nameservers (e.g. `xxx.ns.cloudflare.com`, `yyy.ns.cloudflare.com`).
  4. In the **PKNIC panel**, enter those two into the "Nameserver" field for the domain.
  5. Wait for Cloudflare to show the domain as "Active" (hours to ~2 days). From then on, all DNS records for this domain — Railway's and Namecheap's — get added inside **Cloudflare's DNS tab**, never at PKNIC or Namecheap directly.
- [ ] **Create a Railway account and a new Project** at railway.app (GitHub login is easiest since deploys will pull from your repo). This and the following Railway steps don't need to wait on DNS propagation — Railway gives a free `*.up.railway.app` URL to test with in the meantime.
- [ ] **Add a MySQL database** to the project: "New" → "Database" → "MySQL". Railway provisions it instantly and auto-generates connection variables (host/port/user/password/database) scoped to that service.
- [ ] **Add the backend as a service**: "New" → "GitHub Repo" → select the **backend repo** (frontend and backend are two separate GitHub repos, not one monorepo — point this service at the backend repo's root). Set the start command to `node server.js` if Railway doesn't auto-detect it from `package.json`.
- [ ] **Wire the database into the backend's environment variables.** In the backend service's "Variables" tab, reference the MySQL service's auto-generated variables (Railway lets you reference another service's variable with `${{MySQL.VARIABLE_NAME}}` syntax — check the MySQL service's own "Variables" tab for the exact names it exposes, commonly things like `MYSQLHOST`/`MYSQLPORT`/`MYSQLUSER`/`MYSQLPASSWORD`/`MYSQLDATABASE`). Map those into this app's expected `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` variable names (see `backend/config/db.js`) — the app reads those specific names, not Railway's.
- [ ] **Set the rest of the backend's environment variables**, using `backend/.env.example` as the field list:
  - `JWT_SECRET` / `CREDENTIALS_ENCRYPTION_KEY` — generate fresh (see section 3 below)
  - `NODE_ENV=production`
  - `FRONTEND_URL` — your real domain, e.g. `https://yourdomain.com`
  - `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` — from the Namecheap mailbox you set up (see below)
  - `ADMIN_PATH` — optionally a custom value instead of the repo default
- [ ] **Initialize Railway's MySQL.** Since this is a genuinely fresh database with no data yet, run `npm run db:init` once from `backend/` on your own computer with `.env` temporarily pointed at Railway's DB credentials (check the MySQL service's "Connect" tab for the external connection details) — it applies the full current `schema.sql` in one shot, which already includes every individual migration. Don't run the individual `db:migrate-*` scripts against a fresh database — `db:init` supersedes them. (`db:migrate-*` and the `npm run db:migrate` meta-script that chains all of them exist only for bringing an *already-live, older* database up to date incrementally — see section 2 below.)
- [ ] **Add the frontend as a second service** in the same Railway project: "New" → "GitHub Repo" → the **frontend repo** (a separate repo from the backend). This repo already has a `"start": "serve -s dist -l $PORT"` script and `serve` as a dependency, so add it as a standard Node service (build command `npm run build`, Railway auto-detects the start script) rather than following Railway's dedicated static-site product — the frontend's security headers (CSP, X-Frame-Options — see `public/serve.json`) only apply because `serve` actually runs and reads that file; Railway's separate "Static Sites" offering is a different serving mechanism that doesn't know about it, and wouldn't emit those headers. Don't remove or rename the `"start"` script for the same reason.
- [ ] **Set the frontend's build-time variable**: `VITE_API_URL=https://api.yourdomain.com/api` (baked in at build time, so set this *before* the first deploy of this service).
- [ ] **Connect your custom domains** (only once Cloudflare shows the domain as active). In each Railway service's "Settings" → "Networking" → "Custom Domain": add `yourdomain.com` to the frontend service, and `api.yourdomain.com` to the backend service. Railway will show you a CNAME record and a TXT verification record for each — add both inside **Cloudflare's DNS tab** for the domain (set the CNAME to "DNS only"/grey-cloud, not proxied, until Railway's TLS certificate has verified — you can proxy it afterward if desired).
- [ ] **TLS is automatic** once the CNAME/TXT records propagate and Railway verifies ownership — no separate SSL step needed, unlike the Stellar Plus/cPanel flow.
- [ ] **Buy a Namecheap "Private Email" plan** (their email-only product — not their web/Stellar hosting) and create a mailbox (e.g. `noreply@yourdomain.com` or `orders@yourdomain.com`). Namecheap will give you MX records plus SMTP host/port/username/password. Use the SMTP details in the backend's `SMTP_*` environment variables above.
- [ ] **Add Namecheap's MX records inside Cloudflare's DNS tab** (not at PKNIC or Namecheap — Cloudflare is now the authoritative DNS for the domain, so that's where all records go, mail and web alike). The CNAME records for `yourdomain.com`/`api.yourdomain.com` point at Railway; the MX records point at Namecheap's mail servers. Both live in the same Cloudflare-hosted DNS zone and route independently.

---

## 1. Payment methods — no gateway integration exists (nothing to resolve here)

This section previously described a Safepay payment-gateway integration with several open correctness issues (amount-unit confusion, webhook signature verification, stale-token overwrites, etc.). That integration was never actually built — there is no `safepayController.js` or any Safepay code anywhere in the backend repo (confirmed by grep). `orders.safepay_token` in `schema.sql` is a harmless, intentionally-kept-but-unused leftover column from whenever this was planned.

The only real payment methods in this codebase today are **Cash on Delivery** and **manual bank/wallet transfer with an admin-verified proof screenshot** (see `contentController.js`'s payment-settings shape and `ordersController.js`'s `createOrder`). Neither involves a webhook or a third-party payment API, so none of the concerns this section used to list (amount units, webhook HMAC, stale-token races) apply. Nothing to do here — just don't go looking for a `safepayController.js` that doesn't exist.

If a real payment gateway is added later, re-add a section like this one for it, and treat it as unverified until a real sandbox transaction has been run end-to-end (see the "Payment/third-party integration correctness" guidance in the security-audit skill).

---

## 2. Database migrations

If production is a **genuinely fresh database with no data yet**, don't run individual migrations at all — use `npm run db:init` (see section 0 above), which applies the full current `schema.sql` in one shot and already includes every migration below.

If production is an **existing, already-live database** that predates some of these changes, run the full migration chain (not just a handful — the individual list below has grown well past the original 3 as more features shipped, and running a stale subset would leave production still missing recent tables/columns):

- [ ] From `backend/`, with `.env` pointed at the **production** database:
  ```
  npm run db:migrate
  ```
  This chains every migration in order (2FA, updated-at timestamps, token versioning, discount-guard, sessions, payment-proof, product variants, spec overrides, verification expiry, scale indexes, TOTP replay guard, review status, product video) — check `package.json`'s `db:migrate` script for the current, authoritative list rather than trusting a hardcoded list here, since it grows as features ship.
- [ ] Run this *before* the new backend code goes live, not after — the code expects tables/columns from several of these migrations to already exist, and will throw SQL errors the first time an affected feature is hit if they don't.
- [ ] Confirm the seeded admin account (`ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`, used by `sql/init.js`) is either not re-run against production, or set to credentials you actually intend to use — don't let placeholder/dev values become the real admin login. `sql/init.js` will refuse to seed a weak `ADMIN_PASSWORD` (same length check as every other account), so a placeholder like "admin123" will fail loudly instead of silently succeeding.

---

## 3. Environment variables & secrets

Use `backend/.env.example` as the template — copy it to `backend/.env` on the production server and fill in **production-specific** values. Do not copy your local dev `.env` over as-is.

- [ ] `NODE_ENV=production` — this is not optional. It affects: cookie `secure` flag (requires HTTPS to work at all), strict CORS origin checking, tenant resolution (real `Host` header only, no `X-Store-Slug` override), and error responses (raw DB errors get masked).
- [ ] `JWT_SECRET` and `CREDENTIALS_ENCRYPTION_KEY` — generate fresh values for production, don't reuse your local dev ones: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` for `JWT_SECRET` (32+ chars required — the app refuses to start in production without one), `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` for `CREDENTIALS_ENCRYPTION_KEY` (must be exactly a 64-char hex string). Store them wherever you keep production secrets (Railway's service "Variables" tab, a password manager) — don't commit them to either repo.
- [ ] `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` — production database, using a **dedicated non-root DB user** (same practice as your dev setup — confirmed good in the audit, just carry it forward).
- [ ] `FRONTEND_URL` — your real production frontend domain (e.g. `https://yourstore.com`), not `localhost`. This drives the CORS allowlist, password-reset/verification email links, and the website link now shown on invoices.
- [ ] `PORT` — whatever your host expects the backend to listen on.
- [ ] `ADMIN_PATH` — consider setting a custom obscure value rather than the default, since the default is baked into this repo's source and is effectively public. This is obscurity, not real access control (the backend auth is the real gate) — but there's no reason to leave it at the well-known default either.
- [ ] `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` — production email provider credentials. Test this before launch (see smoke tests below) — password reset and order emails depend on it.

---

## 4. Infrastructure

- [ ] **TLS/HTTPS must be properly terminated** wherever this is hosted. The session cookie's `secure` flag (production) and Helmet's HSTS header are both meaningless — or actively break login — if traffic isn't actually served over HTTPS.
- [ ] **Confirm `FRONTEND_URL` matches your real frontend domain exactly.** The CORS allowlist in `backend/server.js` is derived from this — a mismatch will silently block all API requests from the deployed frontend with CORS errors.
- [ ] **Database backups.** Once real orders/customers exist, make sure automated backups are actually running — not something to discover you need after data loss.
- [ ] **Rate limiting is in-process/in-memory** (`backend/middleware/loginRateLimit.js`, `accountActionRateLimit.js`, `twoFactorRateLimit.js`) — fine for a single server process, but if you ever deploy with multiple instances/containers behind a load balancer, these limits won't be shared across them and become much weaker per-instance. Not a blocker for a typical single-server launch, just something to revisit if you scale horizontally.
- [ ] **Confirm the frontend's security headers actually reach production**, don't just trust that `public/serve.json` exists in the repo. Once the frontend is deployed, run `curl -I https://yourdomain.com/` and confirm `Content-Security-Policy`, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff` are all present in the real response. These headers only apply because `serve -s dist` (the frontend's `npm start`) actually runs and reads `serve.json` — if Railway ever serves this app through a different mechanism (its dedicated "Static Sites" product instead of a standard Node service, or if the `"start"` script in `package.json` is ever removed/renamed), these headers would silently stop being sent with no local-dev signal that anything changed. This local repo can't verify what Railway actually does at runtime — only a real `curl` against the live domain can.

---

## 5. Frontend build

- [ ] Set `VITE_API_URL` to your real production backend URL before building (this gets baked into the built JS at build time, it's not read at runtime).
- [ ] `npm run build` and deploy the `dist/` output.
- [ ] If you add any new `VITE_`-prefixed env vars in the future, remember anything with that prefix ships in the public bundle — never put a real secret behind one (confirmed clean today: only `VITE_API_URL` and `VITE_ADMIN_PATH` exist, neither sensitive).

---

## 6. Smoke test after deploying (in this order)

- [ ] Sign up a real test account, confirm the verification email arrives and the link works.
- [ ] Log in on two different browsers (simulating two devices), log out on one, confirm the other stays logged in (per-device session revocation) — and separately, confirm changing your password or disabling 2FA on one device correctly signs out every *other* device while keeping the one you're using logged in.
- [ ] Request a password reset, confirm the email arrives with the correct production link.
- [ ] Set up 2FA on a test account, log out, log back in with the 2FA code, then disable 2FA — confirm each step works and you're not unexpectedly locked out.
- [ ] Place a test order with Cash on Delivery, confirm it appears correctly in Admin → Orders.
- [ ] Place a test order with manual bank/wallet transfer, upload a proof screenshot, confirm it's flagged for admin review and admin can approve/reject it correctly.
- [ ] Log into the admin panel at your (possibly now-custom) `ADMIN_PATH`, confirm the dashboard loads and stats look right.
- [ ] Run `npm audit --production` one more time in both `backend/` and the frontend root right before launch, in case a new advisory landed since the last check.

---

## Already fixed and verified — no action needed

For reference, these came out of the same audit and are already done, migrated, and tested live:
- Per-device session revocation (`sessions` table): logout only signs out the current device; password-change and 2FA-disable sign out every *other* device while keeping the current one logged in
- Dedicated rate limit for 2FA code verification, separated from unrelated actions
- Rate limiting added to email verification/resend endpoints
- 2FA login challenge now cross-checks the current tenant
- Uploaded file extensions are derived from the validated image format, not the client-supplied filename
- Discount code single-use enforcement now has a DB-level backstop in addition to the existing row lock
