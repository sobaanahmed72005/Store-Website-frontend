---
name: security-audit
description: Full-scope security audit of the ENTIRE codebase (not a diff) — authentication/session handling, injection, business-logic/financial integrity, secrets management, file uploads, dependencies, headers/CORS/rate-limiting, and third-party payment-integration correctness. Use when asked for "a security audit", "full security review", "check the whole app for vulnerabilities", or before a production launch. Produces a severity-ranked findings report and distinguishes verified findings from ones needing live-environment confirmation.
---

# Full-Scale Security Audit

This is a whole-codebase audit, not a `/code-review` of a diff. It exists because point-in-time diff reviews miss systemic issues (an insecure pattern that was already there, a payment integration nobody has tested end-to-end, a rate limiter that covers login but not five other abusable endpoints). Run this when the ask is breadth, not "did my last change introduce a bug."

## How to run this at scale

Do not try to read the entire codebase serially in one context. Split the checklist below into independent domains and dispatch one subagent per domain in parallel (Explore for read-only investigation; general-purpose if a domain needs to run commands like `npm audit` or a concurrency test script). Each subagent should report back with concrete file:line citations — never a vague "looks fine" or "might be an issue." Aggregate their findings yourself, verify the ones you can (see "Verify, don't guess" below), then report using `ReportFindings` if that tool is available, ranked most-severe first.

Domains that parallelize well for a typical full-stack app (adjust to what actually exists in the repo):
1. **Auth & session** — login, logout, password reset, 2FA, session storage, cookie config, role checks
2. **Injection & input handling** — SQL/NoSQL injection, XSS, path traversal, unvalidated input reaching a query/filesystem/shell call
3. **Business logic & financial integrity** — anything involving money, single-use resources, or state transitions
4. **Secrets, dependencies, infra config** — env vars, hardcoded secrets, encryption at rest, CORS, security headers, `npm audit`
5. **Frontend/client security** — what's exposed in bundled JS, client-side trust assumptions, third-party scripts
6. **Payment/external-service integration correctness** (see dedicated section below — this one is commonly wrong and rarely caught by code review alone)

## Verify, don't guess

A finding is not done when you've spotted a suspicious pattern — it's done when you've confirmed it actually behaves that way.
- **Race conditions**: don't just say "this looks like a TOCTOU bug." Write a small script that fires the two requests concurrently against the real dev DB and observe the actual outcome. Code that *looks* racy under a naive read can be safe under the DB's actual isolation level and lock behavior, and vice versa.
- **Auth bypass claims**: reproduce with a real request (curl/Playwright) — hit the endpoint without the cookie, with an expired token, with another tenant's token, etc. — rather than inferring from reading the middleware chain.
- **CORS/header claims**: curl the actual endpoint with a crafted `Origin` header and read the real response headers.
- **Upload validation claims**: actually upload a disguised file (text renamed to `.png`, spoofed `Content-Type`) and confirm the server's real behavior.
- If you cannot verify something (no live account for a third-party service, no production-like environment), say so explicitly and label it "needs live verification" rather than presenting a guess as a confirmed finding.

## Checklist by domain

### 1. Auth & session
- Where are session tokens stored client-side? `localStorage`/`sessionStorage` is readable by any injected script — httpOnly cookies are not. If cookies are used, check `httpOnly`, `secure` (in prod), and `SameSite` are all set correctly for the app's actual origin topology (same-site subdomains vs. genuinely cross-site).
- Is there a working logout that actually invalidates the session server-side, not just a client-side state clear?
- Password hashing: bcrypt/argon2 with a modern cost factor (bcrypt ≥12 as of 2026). Never plaintext, never a fast unsalted hash.
- Rate limiting: check login, AND registration, password-reset request, password-reset confirmation, email verification, and any OTP/2FA-code verification endpoint. It's common to rate-limit only login and leave the others wide open for spam/brute-force.
- Password reset / email verification tokens: cryptographically random (not sequential/guessable), single-use, time-limited, and the "does this email exist" response is identical whether or not the account exists (no user enumeration).
- Role/authorization checks: are they applied at the router level consistently (e.g. one `router.use(requireAdmin)` at the top of an admin router) rather than per-route, where it's easy to forget one? Grep for every mutating route and confirm each has an auth check — don't sample a few and assume the rest match.
- Multi-tenant apps: does every query scope by tenant/business ID? Can a valid session token for tenant A be replayed against tenant B's data?
- High-value accounts (admin, platform-owner equivalents): is 2FA available? If a 2FA system exists, verify: secrets encrypted at rest, recovery codes single-use and hashed (not stored plaintext), login-challenge tokens are short-lived and rate-limited separately from the underlying password check.
- Any authenticated endpoint that's actually dead/unused (leftover from a removed feature) should be flagged for removal — it's attack surface with zero benefit.
- `JWT_SECRET` or equivalent: does the app fail loudly if it's unset, or silently fall back to a hardcoded/predictable default? The latter is a real vulnerability, not a theoretical one.

### 2. Injection & input handling
- SQL/NoSQL: grep for string-concatenated queries. Every user-influenced value must go through parameterized queries/placeholders. Dynamically-built query fragments are only safe if every interpolated piece is a static, code-controlled value (never raw user input), even when it "looks like" just a column name or operator.
- XSS: grep for `dangerouslySetInnerHTML`, `innerHTML`, `v-html`, or server-side HTML templating of user input. Check that user-generated content rendered elsewhere (emails, admin views, exported files) is escaped.
- Path traversal: any endpoint that reads/writes a file based on user input (`../../etc/passwd`-style) must validate/normalize the path first.
- File uploads: is the file type validated by real content (magic bytes / actually decoding it), or only by the client-supplied `Content-Type` header (trivially spoofable)? Are uploaded files re-encoded/sanitized before being served, or served as-is? Is there a size limit? Are executable extensions (`.php`, `.svg` with embedded scripts, `.html`) excluded from upload types that get served publicly?
- Command injection: any use of `exec`/`spawn`/shell calls built from user input.

### 3. Business logic & financial integrity
This is the category generic scanners miss entirely — it requires understanding what the app is supposed to guarantee, not just pattern-matching known vuln shapes.
- Are prices, discounts, shipping fees, and taxes always recomputed server-side at the moment of charge, never trusted from client-submitted values? A client that can submit `{"price": 1}` for a $1000 item is a direct financial loss.
- Single-use resources (discount codes, invite codes, one-time tokens): is "already used" checked and recorded atomically (row lock / unique constraint), or is there a check-then-write gap a concurrent duplicate request could exploit? Verify with an actual concurrency test, not just reading the code.
- State machines (order status, subscription status, etc.): can a client-controlled request skip/reorder states in a way that bypasses a required step (e.g. mark an order "delivered" without ever being "paid")?
- Anything gating access by a boolean/role fetched once at login and cached in a token: does a privilege downgrade (banned user, revoked admin) take effect promptly, or does the stale token keep working until natural expiry?

### 4. Secrets, dependencies, infra config
- Grep for hardcoded API keys/secrets/passwords in source (not just `.env` files — check for anything checked into git history too if you have access to run `git log`).
- Are `.env`/secret files actually gitignored, and confirm via `git log --all --name-only` that no secret file was ever committed even if it's gitignored now.
- Encryption at rest for sensitive stored credentials (payment gateway keys, third-party API secrets, 2FA secrets): symmetric encryption (e.g. AES-256-GCM) with the key itself outside the database, not just relying on DB access controls.
- CORS: is it a wildcard (`*`) or reflecting any origin, especially combined with `credentials: true`? It should allowlist known origins only.
- Security headers: is something like `helmet` (or platform equivalent) applied? Check HSTS, X-Content-Type-Options, frame-options/CSP at minimum.
- Run `npm audit` (or the ecosystem equivalent) and report any high/critical advisories with fix availability.
- Database access: does the app connect as a superuser/root, or a least-privilege dedicated account?
- Any seeded/default credentials (demo admin password, default API key) that would still work in a real deployment if not rotated?

### 5. Frontend/client security
- Anything sensitive embedded in the client bundle: API keys that should be server-side-only, internal URLs, unredacted debug info.
- Client-side route/UI guards (e.g. hiding an admin nav item) are UX only — confirm the *server* independently re-checks authorization on every request those UI guards gate, and say so explicitly when it does (it's a good pattern, not a gap, as long as the backend check exists).
- Third-party scripts loaded from CDNs: are they pinned (SRI hash or specific version), or could a compromised CDN inject arbitrary JS?
- Are there any postMessage handlers or window-level event listeners that trust the message origin unconditionally?

### 6. Payment / third-party service integration correctness
Payment integrations are disproportionately likely to be subtly wrong because they're hard to test without a live account, and code written without ever exercising a real transaction can look plausible while being completely incompatible with the real API. Treat any payment/webhook integration as unverified until proven otherwise:
- Does the webhook signature verification use the exact algorithm, header name, and exact payload/bytes the provider actually signs? Don't trust a comment saying "verify against docs later" — that means it was never verified. Cross-check against the provider's **official SDK source code** (not just prose docs, which are often stale or describe a different API version) — look for signature verification and request/response shape in their GitHub SDKs/plugins across multiple languages if available, since they should all agree.
- Does the amount sent to the payment provider use the unit they actually expect (smallest currency unit / cents vs. whole units)? Getting this wrong by 100x is a silent, catastrophic billing bug that won't show up until real money moves.
- Does the webhook handler verify the paid amount matches the expected order total, or does it trust any "PAID" event for a matching ID? A missing amount check is a lower-severity defense-in-depth gap; a missing signature check is a critical forgery vulnerability.
- Is the webhook idempotent (a replayed/duplicate valid webhook can't double-apply an effect like double-crediting an order)?
- If the merchant has never actually completed a real transaction through this integration, say so plainly and flag the whole integration as "unverified — needs a live sandbox test before going live," rather than fixing one piece of it and implying the rest is solid.

## Reporting

Rank findings most-severe first. For each finding give: what's wrong, exactly where (file:line), the concrete failure scenario (not just "this is bad practice"), and whether it's CONFIRMED (you reproduced it) or PLAUSIBLE (code strongly suggests it but you couldn't verify live). Explicitly list what's already done well — an audit that only lists problems is less useful than one that also tells the reader what NOT to waste time re-checking.

Don't scope-creep the fix into unrelated hardening the user didn't ask about (e.g. don't add a CSRF token system on top of a fix for something else just because it occurred to you) — flag it as a separate suggested follow-up instead, with your reasoning for why it would or wouldn't matter given the app's actual architecture.
