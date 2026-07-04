# Deployment Checklist

Everything to do before, during, and right after taking this store live. Check items off as you go. Grouped by when it needs to happen.

---

## 0. Hosting setup — Railway (app) + PKNIC (domain, already owned) + Namecheap (email only)

Decided setup: the domain is already registered separately at **PKNIC** (not Namecheap) — that registration doesn't change. The actual app (frontend, backend, and database) all runs on **Railway** (Hobby plan, $5/mo, usage-based beyond that). Railway doesn't offer mailbox/email hosting, so a mailbox is set up at **Namecheap** (its email-only "Private Email" product, not their web hosting) purely for sending order/verification emails and receiving customer replies. This means DNS records live at **PKNIC's** DNS panel: CNAME/TXT records point at Railway for the app, and MX records point at Namecheap for mail. Confirm PKNIC's control panel supports adding custom CNAME/TXT/MX records before proceeding — if it's restrictive, you may need to ask PKNIC support or use their nameserver-delegation option instead.

- [ ] **Create a Railway account and a new Project** at railway.app (GitHub login is easiest since deploys will pull from your repo).
- [ ] **Add a MySQL database** to the project: "New" → "Database" → "MySQL". Railway provisions it instantly and auto-generates connection variables (host/port/user/password/database) scoped to that service.
- [ ] **Add the backend as a service**: "New" → "GitHub Repo" → select this repo, and set its **root directory to `backend/`** (important — this repo has both frontend and backend in one repo, and the backend needs its own service pointed only at that folder). Set the start command to `node server.js` if Railway doesn't auto-detect it from `package.json`.
- [ ] **Wire the database into the backend's environment variables.** In the backend service's "Variables" tab, reference the MySQL service's auto-generated variables (Railway lets you reference another service's variable with `${{MySQL.VARIABLE_NAME}}` syntax — check the MySQL service's own "Variables" tab for the exact names it exposes, commonly things like `MYSQLHOST`/`MYSQLPORT`/`MYSQLUSER`/`MYSQLPASSWORD`/`MYSQLDATABASE`). Map those into this app's expected `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` variable names (see `backend/config/db.js`) — the app reads those specific names, not Railway's.
- [ ] **Set the rest of the backend's environment variables**, using `backend/.env.example` as the field list:
  - `JWT_SECRET` / `CREDENTIALS_ENCRYPTION_KEY` — from `DEPLOYMENT.secrets.local`
  - `NODE_ENV=production`
  - `FRONTEND_URL` — your real domain, e.g. `https://yourdomain.com`
  - `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` — from the Namecheap mailbox you set up (see below)
  - `ADMIN_PATH` — optionally a custom value instead of the repo default
- [ ] **Run the three database migrations against Railway's MySQL.** Unlike Stellar Plus, Railway's databases are reachable from your own machine (check the MySQL service's "Connect" tab for the external connection details), so you can run these the normal way from `backend/` on your own computer with `.env` temporarily pointed at Railway's DB credentials:
  ```
  npm run db:migrate-token-version
  npm run db:migrate-discount-guard
  npm run db:migrate-sessions
  ```
  (Or run `npm run db:init` instead, once, if this is a genuinely fresh database with no data yet — it applies the full current `schema.sql` in one shot, making the three migrations above unnecessary.)
- [ ] **Add the frontend as a second service** in the same Railway project: "New" → "GitHub Repo" → same repo, but set the **root directory to the repo root** (where the frontend's `package.json` lives) and follow [Railway's static-site guide](https://docs.railway.com/guides/static-hosting) — set the build command to `npm run build` and let Railway serve the `dist/` output.
- [ ] **Set the frontend's build-time variable**: `VITE_API_URL=https://api.yourdomain.com/api` (baked in at build time, so set this *before* the first deploy of this service).
- [ ] **Connect your custom domains.** In each service's "Settings" → "Networking" → "Custom Domain": add `yourdomain.com` to the frontend service, and `api.yourdomain.com` to the backend service. Railway will show you a CNAME record and a TXT verification record for each — add both in **PKNIC's DNS panel** for your domain. You do **not** need to move the domain's registration or nameservers away from PKNIC — just add these specific records there.
- [ ] **TLS is automatic** once the CNAME/TXT records propagate and Railway verifies ownership — no separate SSL step needed, unlike the Stellar Plus/cPanel flow.
- [ ] **Buy a Namecheap "Private Email" plan** (their email-only product — not their web/Stellar hosting) and create a mailbox (e.g. `noreply@yourdomain.com` or `orders@yourdomain.com`). Namecheap will give you MX records plus SMTP host/port/username/password. Use the SMTP details in the backend's `SMTP_*` environment variables above.
- [ ] **Add Namecheap's MX records at PKNIC's DNS panel** (not at Namecheap — the domain's authoritative DNS is at PKNIC, so that's where all records go, mail and web alike). The CNAME records for `yourdomain.com`/`api.yourdomain.com` point at Railway; the MX records point at Namecheap's mail servers. Both live in the same PKNIC-hosted DNS zone and route independently.

---

## 1. Must resolve before accepting real payments (Safepay)

These came out of the security audit and are still open. None of them are safe to skip if real money will move through Safepay.

- [ ] **Run one real Safepay sandbox transaction end-to-end** and inspect the actual request/response bytes. This single test answers the two questions below — don't guess at either.
- [ ] **Confirm the amount unit.** `backend/controllers/safepayController.js` currently multiplies the order total by 100, assuming Safepay wants paisa. Safepay's own published examples show plain decimal rupee amounts instead. If the live API expects rupees, every transaction will attempt to charge **100x** the real total. Fix in `safepayController.js` around the `amountInPaisa` calculation once confirmed.
- [ ] **Confirm the webhook signature payload.** The code HMACs the full raw request body; Safepay's docs have shown examples hashing just the tracker token string instead. If wrong, no payment will ever auto-confirm (fails closed — orders get stuck in `pending_payment`, not a security hole, but nothing will work). Fix in the webhook handler's HMAC computation once confirmed.
- [ ] **Add an amount cross-check in the webhook handler** — currently it trusts token match + `state === 'PAID'` with no comparison against `order.total_amount`. Add this once the amount format above is confirmed.
- [ ] **Fix the stale-token overwrite.** Creating a new Safepay session unconditionally overwrites `orders.safepay_token`. If a customer opens checkout twice and pays via the older token, the webhook can't find the order and the payment is silently lost. (`safepayController.js`, session-creation function.)
- [ ] **Make the webhook status update atomic.** It currently does a `SELECT` then a separate `UPDATE` with no `WHERE status = 'pending_payment'` guard on the update itself — a replayed webhook could theoretically double-process. Match the pattern already used correctly in the admin order-status-change code (`ordersController.js`).
- [ ] **Switch the signature comparison to `crypto.timingSafeEqual`** instead of `!==` — same pattern already used correctly in `backend/utils/unsubscribeToken.js`.
- [ ] **Add a way to release stock from abandoned Safepay checkouts.** Stock is decremented as soon as an order is created, even before payment completes, and `pending_payment` orders currently can't transition to `cancelled` through the normal admin UI — so an abandoned checkout holds that stock forever. Either add a scheduled job to expire old `pending_payment` orders, or allow `pending_payment → cancelled` as a valid admin transition.

---

## 2. Database migrations

Schema changes were made locally as part of the security fixes. They need to run against whatever database production actually uses — **not just your local one**.

- [ ] From `backend/`, with `.env` pointed at the **production** database:
  ```
  npm run db:migrate-token-version
  npm run db:migrate-discount-guard
  npm run db:migrate-sessions
  ```
- [ ] Run these *before* the new backend code goes live, not after — the code expects the `sessions` table and the `single_use_guard` column to already exist, and will throw SQL errors on login/checkout if they don't. (`token_version` on `users` is no longer used by the code — superseded by the `sessions` table below — but the migration is harmless to run regardless.)
- [ ] Confirm the seeded admin account (`ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`, used by `sql/init.js`) is either not re-run against production, or set to credentials you actually intend to use — don't let placeholder/dev values become the real admin login.

---

## 3. Environment variables & secrets

Use `backend/.env.example` as the template — copy it to `backend/.env` on the production server and fill in **production-specific** values. Do not copy your local dev `.env` over as-is.

- [ ] `NODE_ENV=production` — this is not optional. It affects: cookie `secure` flag (requires HTTPS to work at all), strict CORS origin checking, tenant resolution (real `Host` header only, no `X-Store-Slug` override), and error responses (raw DB errors get masked).
- [ ] `JWT_SECRET` and `CREDENTIALS_ENCRYPTION_KEY` — already generated and waiting for you in **`DEPLOYMENT.secrets.local`** (repo root). That file is excluded from git (matches the `*.local` rule already in `.gitignore` — confirmed with `git check-ignore`), so the values only exist on your machine. Copy them into production's `backend/.env` when you provision the server; don't reuse them locally, don't paste them anywhere else, don't rename the file to something git would track.
  - If you ever need fresh ones instead (e.g. these leak somehow): `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` for `JWT_SECRET`, `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` for `CREDENTIALS_ENCRYPTION_KEY`.
- [ ] `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` — production database, using a **dedicated non-root DB user** (same practice as your dev setup — confirmed good in the audit, just carry it forward). Blank placeholders for these are also in `DEPLOYMENT.secrets.local` — fill them in once you pick a host.
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
- [ ] Place a test order with Safepay **in sandbox mode first** — do not point it at live Safepay until section 1 above is fully resolved and you've watched a sandbox transaction complete correctly end-to-end.
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
