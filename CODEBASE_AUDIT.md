# Full Codebase Audit — Store-Website (frontend + backend)

Date: 2026-07-14
Scope: entire repo state (not a diff), both `Store-Website-frontend` and `Store-Website-backend`, covering scalability/growth risk, general code quality, and a full security pass (auth, injection, secrets/infra, business-logic/financial integrity).

This is a **fresh, independent audit** — it does not re-list the 8 items already fixed in the prior cleanup pass (error boundary, admin page dedup, shared data-fetching hook, AdminProfile split, code-splitting, silent-catch fixes, repo hygiene, Playwright smoke test). Those are done and verified; see git history on `codebase-cleanup`.

Every finding below states whether it was **CONFIRMED** (reproduced live — a real HTTP request, a concurrency test, a built-bundle grep, etc.) or **PLAUSIBLE** (strong code evidence, not independently reproduced, with the reason why). A lot of this codebase is in genuinely good shape — the "what's already solid" sections are not padding, they're there so you don't waste time re-checking things that already work.

---

## How to read this

- **HIGH** — will cause real breakage or loss (crashes, financial impact, data corruption) under expected conditions, especially as traffic/data grows.
- **MEDIUM** — a real bug or gap, bounded impact or requires a specific precondition (e.g. attacker already has a session).
- **LOW** — real but low-impact, or a fragile pattern that isn't currently exploitable.
- **INFO** — not a bug; a documented tradeoff or a suggestion worth knowing about.

---

## HIGH severity

### H1. Admin pages fetch entire tables with no pagination — will hang/crash as the store grows
**Files:**
- `src/pages/admin/AdminOrders.jsx:64-71` — `GET /admin/orders` loads *every* order, no limit/page/date filter, rendered into one table with per-row expansion.
- `src/pages/admin/AdminCustomers.jsx:13` — `GET /admin/customers` loads the entire customer table; client-side substring filter runs on every keystroke.
- `src/pages/admin/AdminProducts.jsx:14-19` — same pattern for products, also reused unpaginated in `AdminBulkSale.jsx:18` and `AdminReviews.jsx:37` (product picker dropdown).
- `src/pages/admin/AdminNewsletter.jsx:15-20` — all subscribers (active + unsubscribed) loaded unpaginated; the "Send to N Subscribers" broadcast count is driven off this same unfiltered array.
- `src/pages/admin/AdminDiscountCodes.jsx:14` — full unpaginated list, grows unbounded over years of promos.

**Failure scenario:** you said this is about to get real traffic and grow — at a few thousand orders/customers/products this becomes a multi-MB JSON response and thousands of DOM rows rendered synchronously. The admin panel will hang or the tab will crash well before any of these tables reach "10k rows." This is the single most direct match to your stated worry ("my code may crash or break at any point" as it grows).

**What's already correct, for contrast:** `AdminAuditLog.jsx` is server-paginated — that's the pattern the rest should follow.

**Fix shape:** add `LIMIT`/`OFFSET` (or cursor) pagination server-side for each of these endpoints, page controls client-side. This is a real, non-trivial fix (touches backend routes + controllers + frontend), not a one-liner — plan it as its own piece of work.

### H2. Storefront product listings also fetch everything, unpaginated — affects every customer, not just admins
**Files:** `src/pages/Products.jsx:88-92`, `src/pages/Shop.jsx:73-77`, `src/pages/CategoryListing.jsx:78-79`, `src/pages/SearchResults.jsx:30`

**Failure scenario:** every one of these public, unauthenticated pages fetches the *entire* matching product set and filters/sorts client-side. As your catalog grows past a few hundred SKUs, this directly slows down page load and increases bounce rate for paying customers — this is the one that costs you sales, not just an admin's patience.

**Fix shape:** same as H1 — needs real server-side pagination/limit, ideally with the filter/sort criteria passed as query params so the server does the filtering too instead of shipping the whole catalog to the browser every time.

---

## MEDIUM severity

### M1. Cancelled/returned orders never restore product stock — CONFIRMED live
**File:** `Store-Website-backend/controllers/ordersController.js` — stock decrements atomically on order creation (~line 112), but `updateOrderStatus()` (line 481) and `applySyncedOrderStatus()` (line 542) never increment it back on any transition, including `-> cancelled` or `delivered -> returned`.

**Reproduced:** product stock=5 → order for qty=2 placed → stock correctly dropped to 3 → admin cancelled the order (legal transition) → stock **stayed at 3**, should have gone back to 5.

**Impact:** every cancelled or returned order permanently shrinks visible inventory. Deterministic, 100% reproducible, will silently understate real stock over the store's lifetime and can show false "out of stock" on items you actually have.

### M2. Logout doesn't invalidate the already-issued access token — CONFIRMED live
**Files:** `Store-Website-backend/controllers/authController.js:225-234` (logout only revokes the refresh/session row), `middleware/auth.js:5-26` (`requireAuth` never checks session revocation — pure stateless JWT verify).

**Reproduced:** logged in → captured access cookie → called logout (session correctly revoked in DB, confirmed) → replayed the **pre-logout** access token against `GET /api/auth/me` → still got a `200` with full profile. The refresh token was correctly rejected.

**Impact:** any request bearing a stolen/captured pre-logout access token keeps working for up to 15 minutes after the user logs out. This is a deliberate, documented, *bounded* tradeoff (comment in `authCookies.js:6-8`) — flagging it so you know precisely how it behaves, not necessarily demanding a fix. Matters more if you ever add account banning/role demotion (see M-adjacent note below).

### M3. Several security-sensitive endpoints have no rate limiting — CONFIRMED live
**File:** `Store-Website-backend/routes/auth.js`

| Route | Rate limited? |
|---|---|
| `/login`, `/admin-login` | ✅ yes (5 fails → 15min lock, confirmed live) |
| `/2fa/verify` | ✅ yes |
| `/refresh` | ✅ yes |
| `/forgot-password`, `/reset-password` | ✅ yes |
| **`PUT /me`** | ❌ no |
| **`PUT /change-password`** | ❌ no |
| **`POST /2fa/setup`** | ❌ no |
| **`POST /2fa/confirm`** | ❌ no |
| **`POST /2fa/disable`** | ❌ no |
| `POST /discount-codes/validate` | ❌ no (separate route, same gap) |

**Reproduced:** 15 rapid wrong-password attempts against `PUT /change-password` and `POST /2fa/disable` — never rate-limited (compare: `/login` correctly returns `429` on the 6th attempt).

**Impact:** requires an attacker to already hold a valid session (e.g. via M2's window, a shared device, or a stolen access token), but once they do, `2fa/disable` is the one endpoint that can strip a security control off an account with unlimited guesses at the password + TOTP/recovery code. This is the most consequential of the unrated endpoints.

### M4. React context providers pass a new object/functions on every render — app-wide unnecessary re-renders
**Files:** `src/context/CartContext.jsx:157-176`, `CurrencyContext.jsx:72-76`, `AuthContext.jsx:65-69`, `WishlistContext.jsx:74-89`, `CategoryContext.jsx:21-25`, `SiteSettingsContext.jsx:49-53`

None of these `value={{ ... }}` objects are memoized. Since these wrap the entire app, any state change in one (e.g. `cartOpen` toggling) re-renders every consumer of that context, and functions like `openCart`/`format` get new identities every render, defeating `React.memo` on any child that receives them.

**Fix shape:** wrap each provider's `value` in `useMemo`, and event-handler functions in `useCallback`. Mechanical, low-risk, worth doing as the app grows and re-render cost starts to matter more.

### M5. Cart-to-server sync isn't debounced
**File:** `src/context/CartContext.jsx:62-65` — fires a full-cart `PUT` request on every `items` mutation with no debounce.

**Failure scenario:** clicking the quantity `+`/`-` stepper rapidly fires one full PUT per click, racing each other with no ordering guarantee — a slow earlier request can land after a later one and silently revert the quantity server-side.

### M6. Checkout's payment/shipping selector is not keyboard-accessible
**File:** `src/pages/Checkout.jsx:33-57` (`RadioCard`) — rendered as `<div onClick={...}>` with no `role`, `tabIndex`, or `onKeyDown`.

**Impact:** keyboard-only users cannot select a payment method at all — a hard blocker, not a nice-to-have, on the one page that makes you money.

### M7. Four storefront listing pages are ~85% duplicated code
**Files:** `src/pages/Products.jsx`, `Shop.jsx`, `CategoryListing.jsx`, `SearchResults.jsx` — same sidebar/filter/sort logic, same `SORT_OPTIONS` map (copy-pasted with a reordered key between two of them), same `<ProductCard {...getEffectivePrice(p)} />` block repeated verbatim 6 times across these plus `Home.jsx` and `Product.jsx`.

`Products.jsx` has a comment acknowledging it's kept separate from `Shop.jsx` for SEO/URL reasons — that's a fine reason to keep them at separate routes, but doesn't require duplicating the actual filter/sort/render *logic*; that part could become a shared `useProductListing()` hook + `<ProductGrid>` component without touching the URL/SEO strategy.

---

## LOW severity

### L1. `Account.jsx:356` — `order.items.map(...)` has no null/empty-array guard
If the backend ever returns an order without a populated `items` array (partial failure, future lightweight list endpoint), this throws and crashes the whole Account page.

### L2. `AdminAuditLog.jsx:17-41` (`formatDetails`) assumes specific nested shapes per action type with no defensive checks
A malformed or legacy audit-log row throws inside `.map()` and takes down the entire table instead of just that row.

### L3. `CurrencyContext.jsx:38-53` — a currency enabled by the admin but missing a live rate silently displays PKR-scale numbers under the wrong currency symbol
Not a crash, but a silently-wrong price display — worth fixing given it's price-facing.

### L4. Promotional campaign emails don't escape `subject`/`message` before HTML interpolation
**File:** `Store-Website-backend/controllers/promotionalEmailsController.js:18,20-37` — inconsistent with every other email path in the codebase (contact form, order emails, templated placeholders all call `escapeHtml()`). Requires admin-level access to exploit (it's admin-authored campaign copy), so severity is low, but it's a real gap relative to the codebase's own established pattern.

### L5. Email verification tokens never expire
**File:** `Store-Website-backend/controllers/authController.js:409-418`, `sql/schema.sql:71` — no expiry column or check, unlike the password-reset token which correctly enforces a 1-hour window. Token itself is unguessable (256-bit random) and single-use, so impact is limited to "a years-old unclicked verification link still works."

### L6. DB connection-level errors leak internal infra details (host/port) regardless of `NODE_ENV`
**File:** `Store-Website-backend/server.js:130-136` — the "mask DB errors in production" logic only catches *query-level* mysql2 errors (which carry `sqlMessage`/`sqlState`). A *connection-level* failure (DB down/unreachable) is a plain `Error` and slips through, so during any DB outage every caller — including unauthenticated ones — sees the literal `connect ECONNREFUSED 127.0.0.1:3306` string. Only triggers during infra failure, but that's exactly when you don't want to be handing out internal topology to whoever's watching.

### L7. `category_attributes`/`category_attribute_options` mutations use a bare `WHERE id = ?` without a `business_id` filter in the query itself
**File:** `Store-Website-backend/controllers/categoryAttributesController.js:58,71,108,126` — currently safe because every call site is preceded by a separate `business_id`-scoped ownership check using the same id. Not exploitable today, but it's a fragile pattern relative to the rest of the codebase's consistent `... AND business_id = ?` style — a future refactor that extracts the mutation into a shared helper without carrying the check would silently reintroduce a cross-tenant bug.

### L8. Index-as-key on reorderable admin banner lists
**File:** `src/pages/admin/AdminBanners.jsx:155,264` — `slides.map((slide, i) => <div key={i}>)`. Harmless today (rows are stateless), but the list is explicitly reorderable (`moveSlide` swaps positions) — any future addition of local input state to a row will silently show the wrong slide's data after a move/delete.

### L9. "Single-use" discount codes are single-use *per customer*, not globally single-use
**Files:** `Store-Website-backend/sql/schema.sql` (unique index is `(single_use_guard, user_id)`), `discountCodesController.js:34-44`. This is what the code is designed to do, not a bug in its own logic — flagging only in case your actual intent was "only the very first customer ever" rather than "each customer once."

### L10. `cart_items.price` is trusted from client input, but never actually used to charge anything
**File:** `Store-Website-backend/controllers/cartController.js:31` — confirmed by tracing every read of this column: `createOrder()` always recomputes price from the live `products` table. Zero financial impact; at worst a stale price briefly shown in a "resume cart" UI before checkout.

---

## INFORMATIONAL

- **No payment gateway is actually integrated.** Grepped for `safepay`/`webhook`/`gateway` — only a vestigial unused `orders.safepay_token` column (explicitly commented as leftover from a removed integration) and an unused `payment_gateways` table. Live payment methods are Cash on Delivery and manual bank/wallet transfer with admin-verified screenshots. This isn't "a broken integration" — there's nothing live to audit. Worth knowing plainly in case you believed a gateway was already wired up.
- **Content-Security-Policy is explicitly disabled** (`server.js:68-73`, `helmet({ contentSecurityPolicy: false })`) — a documented, reasoned choice for a pure JSON API with cross-origin product images, not an oversight. Revisit if you ever add an HTML-serving/SSR surface.
- `jwt.verify()` doesn't explicitly pin `algorithms: ['HS256']`. Not currently exploitable with the installed `jsonwebtoken` version, but pinning it explicitly is cheap defense-in-depth.
- DB user is a scoped, non-root account (`czone_user`) by naming convention; couldn't independently verify its actual GRANT scope from inside this sandbox.

---

## What's already solid — confirmed, don't re-check these

**Security — auth & session**
- Session identity lives only in httpOnly cookies; never in `localStorage`/`sessionStorage` (confirmed in both source and the built bundle).
- Password hashing: bcrypt cost 12, uniformly applied.
- Login rate limiting works (confirmed live: 429 after 5 failed attempts).
- Password reset & verification tokens are cryptographically random (256-bit), reset token is time-limited + single-use.
- User enumeration is prevented on forgot-password (confirmed live: identical response for real vs. fake email).
- Authorization is applied at the router level for admin (`router.use(requireAdmin)` covering 60+ routes) and wishlist — the robust pattern, not easy to forget on a new route. Every route across all 13 route files was individually checked; nothing mutating is missing an auth check.
- **Multi-tenant isolation confirmed with a real cross-tenant live test** — a second business's product was unreachable (404) by the first business's admin, and a JWT replayed against a different tenant slug was correctly rejected (401).
- No mass-assignment: registration can't set `role`, DB defaults to `customer`.
- 2FA: secrets encrypted at rest (AES-256-GCM), recovery codes bcrypt-hashed and single-use, login-challenge tokens fully decoupled from the session JWT with their own 5-minute TTL and rate limit.
- Password change / 2FA disable correctly revoke all other sessions on the account.
- `JWT_SECRET`/`CREDENTIALS_ENCRYPTION_KEY`: no hardcoded fallback, process refuses to run correctly if unset (confirmed non-default values in the live `.env`).

**Security — injection & infra**
- SQL injection: all ~195 queries across every controller/middleware reviewed — 100% parameterized, no user input ever reaches raw query text (including sort/column-name style params, which are checked against hardcoded allowlists).
- XSS: zero `dangerouslySetInnerHTML`/`innerHTML` anywhere in the frontend. Backend emails are consistently HTML-escaped except the one promo-email gap (L4).
- File uploads: **confirmed live** — a text file disguised as `.png` with a spoofed `Content-Type` was rejected, because uploads are decoded/validated by real image content (via `sharp`) and re-encoded, not trusted by extension/header.
- Path traversal: payment-proof filenames are regex-validated plus ownership-checked before any file read.
- No command injection surface (`exec`/`spawn` not used anywhere).
- CORS: strict origin allowlist, confirmed live — an evil origin gets a hard 403 (not just a missing header), the real frontend origin gets an exact echo + credentials (not a wildcard).
- Security headers present via helmet (HSTS, X-Content-Type-Options, X-Frame-Options).
- No hardcoded secrets anywhere in either repo; `.env` never committed in either repo's git history.
- `npm audit`: **0 vulnerabilities** in both frontend and backend.

**Security — business logic & financial integrity**
- **Price/discount/shipping is always server-recomputed** — confirmed by directly tampering with request bodies (submitting `price:1`, `discount_amount:99999`, etc.) and observing the server ignores all of it and charges the real amount.
- **Discount-code redemption race safety confirmed under real concurrency** (`SELECT ... FOR UPDATE` + a DB unique-constraint backstop) — fired 8 simultaneous redemption attempts of the same single-use code, exactly one succeeded every time.
- **Stock overselling is prevented, confirmed under real concurrency** — fired a 10-way race against 3 units of stock; exactly 3 orders succeeded, stock landed at exactly 0, no phantom orders.
- **Order status state machine is enforced server-side** — an admin cannot skip from `pending` straight to `delivered`; verified with a direct attempt. The transition itself is also race-safe (confirmed: two concurrent conflicting updates on the same order → exactly one wins, the other gets a clean 409, no lost update).
- No customer-facing route can mutate order status at all — verified only admin routes exist for it, and a customer session gets a clean 403 against the admin endpoint.

**Frontend/client**
- Zero secrets or sensitive data in the shipped JS bundle (verified by grepping the actual built `dist/` output, not just source).
- No third-party CDN scripts anywhere (only a Google Fonts *stylesheet*, no external `<script src>` at all) — nothing for a compromised CDN to exploit.
- No `postMessage` listeners anywhere — nothing to audit for origin spoofing.
- Client-side admin route guard is correctly treated as UX-only, with the backend independently re-checking on every request.

---

## Suggested order of attack, given "about to get real traffic and about to grow a lot"

1. **H1 + H2 (pagination)** — this is the one that will actually break under your stated growth scenario. Everything else is either already-safe or bounded-impact.
2. **M1 (stock not restored on cancel)** — will start producing wrong inventory data from day one of real order volume, and gets harder to reconcile the longer it runs uncorrected.
3. **M3 (missing rate limits on 2FA/password endpoints)** — cheap to fix (reuse the existing rate-limit middleware on 3-4 more routes), closes a real gap.
4. **M6 (keyboard-inaccessible checkout)** — cheap, and it's your money page.
5. Everything else (M2, M4, M5, M7, and the LOW list) — real, but lower urgency; batch them into normal iteration rather than treating as fire drills.

I did not fix anything in this pass — this is a read-only audit, same as the original one. Tell me which items you want tackled and I'll work through them the same way as the last cleanup pass (one at a time, verified live, your confirmation before moving to the next).
