const { defineConfig, devices } = require('@playwright/test');

// These E2E/accessibility/visual/SEO/responsive tests exercise the React
// client only, against mocked /api/* responses (see e2e/mock-api.js) — they
// never need the real Express server, which shells out to Windows-only
// netsh/arp/ping commands and can't run cross-platform in CI.
module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  // This machine's disk (OneDrive-synced project folder) is slow enough that
  // the default 30s test / 5s expect timeouts are occasionally too tight —
  // Firefox in particular has been observed taking >30s just to navigate.
  // Bump both rather than let CI flake on I/O speed.
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 45000,
    actionTimeout: 15000
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } }
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    cwd: './client',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000
  }
});
