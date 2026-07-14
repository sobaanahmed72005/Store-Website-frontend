import { defineConfig } from '@playwright/test'

// Smoke tests hit a real running backend (same as local dev — see README/DEPLOYMENT.md for
// setup), so they're excluded from the default lint/build CI step and run on demand via
// `npm run test:e2e`.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
