import { test, expect } from '@playwright/test'

// These run against the live backend (same as smoke.spec.js — see README/DEPLOYMENT.md for
// setup). Positive-login tests need real credentials via E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD
// (see .env.example) and skip gracefully when unset, since there's no seeded test account
// guaranteed to exist in every environment this runs against. Negative-path tests need no
// credentials at all, so they always run.
//
// /auth/login and /auth/admin-login are rate-limited server-side (5 attempts, see
// CODEBASE_AUDIT.md M3) — repeated runs of the wrong-credentials tests below can trip that
// limiter, in which case the backend correctly returns a lockout message instead of "Invalid
// credentials". Both tests accept either message; they're checking that a server-reported auth
// failure surfaces inline, not pinning the exact attempt threshold.

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD

test.describe('storefront sign-in — negative paths (no real account needed)', () => {
  test('wrong credentials show an inline error and keep the user on the sign-in page', async ({ page }) => {
    await page.goto('/signin')
    const form = page.locator('form')
    await form.getByPlaceholder('Email', { exact: true }).fill('definitely-not-a-real-account@example.com')
    await form.getByPlaceholder('Password').fill('wrong-password')
    await form.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByText(/invalid credentials|too many failed login attempts/i)).toBeVisible()
    await expect(page).toHaveURL('/signin')
  })

  test('submitting with empty fields is blocked client-side (HTML5 required)', async ({ page }) => {
    await page.goto('/signin')
    const form = page.locator('form')
    await form.getByRole('button', { name: 'Sign In' }).click()

    // No navigation and no server round trip — the browser's own validation stops it.
    await expect(page).toHaveURL('/signin')
    const isInvalid = await form.getByPlaceholder('Email', { exact: true }).evaluate((el) => !el.validity.valid)
    expect(isInvalid).toBe(true)
  })

  test('"Forgot password?" link navigates to the forgot-password page', async ({ page }) => {
    await page.goto('/signin')
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await expect(page).toHaveURL('/forgot-password')
  })

  test('"Signup" link navigates to the sign-up page', async ({ page }) => {
    await page.goto('/signin')
    await page.getByRole('link', { name: 'Signup' }).click()
    await expect(page).toHaveURL('/signup')
  })
})

test.describe('admin sign-in — negative paths (no real account needed)', () => {
  test('wrong credentials show an inline error on the admin login form', async ({ page }) => {
    await page.goto('/mgmt-8f2k1c/login')
    await page.getByPlaceholder('Admin email').fill('not-an-admin@example.com')
    await page.getByPlaceholder('Password').fill('wrong-password')
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Login attempts against this endpoint are rate-limited server-side (see CODEBASE_AUDIT.md)
    // — repeated runs of this exact test can trip it, in which case the backend correctly
    // reports the lockout instead of "Invalid credentials". Either is a passing outcome here;
    // this test is about the form surfacing *some* server-reported auth error inline, not about
    // pinning the exact rate-limit threshold.
    const errorBanner = page.locator('form').getByText(/invalid credentials|too many failed login attempts/i)
    await expect(errorBanner).toBeVisible()
    await expect(page).toHaveURL('/mgmt-8f2k1c/login')
  })

})

test.describe('admin sign-in — real account round trip', () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'set E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD to run this')

  test('signs in with valid admin credentials and lands on the admin dashboard', async ({ page }) => {
    await page.goto('/mgmt-8f2k1c/login')
    await page.getByPlaceholder('Admin email').fill(ADMIN_EMAIL)
    await page.getByPlaceholder('Password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Either lands straight on the dashboard, or stops at a 2FA challenge if the account has it
    // enabled — both are valid outcomes of "correct credentials", so branch on which one shows.
    const twoFactorHeading = page.getByRole('heading', { name: 'Two-Factor Verification' })
    await Promise.race([
      page.waitForURL('/mgmt-8f2k1c', { timeout: 10000 }),
      twoFactorHeading.waitFor({ state: 'visible', timeout: 10000 }),
    ])

    if (page.url().endsWith('/mgmt-8f2k1c')) {
      await expect(page.getByText(/dashboard/i).first()).toBeVisible()
    } else {
      test.info().annotations.push({ type: 'note', description: '2FA is enabled on this account — stopping short of entering a live code' })
    }
  })

  test('re-visiting the admin login page while already signed in redirects straight to the dashboard', async ({ page }) => {
    await page.goto('/mgmt-8f2k1c/login')
    await page.getByPlaceholder('Admin email').fill(ADMIN_EMAIL)
    await page.getByPlaceholder('Password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: 'Sign In' }).click()

    const onDashboard = () => page.url().endsWith('/mgmt-8f2k1c')
    await Promise.race([
      page.waitForURL('/mgmt-8f2k1c', { timeout: 10000 }),
      page.getByRole('heading', { name: 'Two-Factor Verification' }).waitFor({ state: 'visible', timeout: 10000 }),
    ])
    test.skip(!onDashboard(), '2FA is enabled on this account — skipping the already-signed-in redirect check')

    await page.goto('/mgmt-8f2k1c/login')
    await expect(page).toHaveURL('/mgmt-8f2k1c')
  })
})
