const { test, expect } = require('@playwright/test');
const { mockApi } = require('./mock-api');

// FiWi V2 is a localhost-only tool, not a publicly crawled site, so this is
// intentionally scoped to the meta/head basics that still matter: a
// meaningful <title>, a description for link previews/PWA install prompts,
// a mobile viewport tag, and a favicon — rather than robots/sitemap/canonical
// concerns that don't apply here.
test.describe('SEO / document metadata', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
  });

  test('has a descriptive, non-empty <title>', async ({ page }) => {
    await expect(page).toHaveTitle(/FiWi V2/);
  });

  test('has a meta description', async ({ page }) => {
    const description = page.locator('head meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.+/);
  });

  test('has a mobile-friendly viewport meta tag', async ({ page }) => {
    const viewport = page.locator('head meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('declares a document language', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('has a favicon link', async ({ page }) => {
    const favicon = page.locator('head link[rel="icon"]');
    await expect(favicon).toHaveCount(1);
  });

  test('the h1-equivalent brand title is present and visible', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText(/FiWi V2/);
  });
});
