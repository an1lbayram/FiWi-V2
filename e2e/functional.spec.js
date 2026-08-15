const { test, expect } = require('@playwright/test');
const { mockApi } = require('./mock-api');

// Functional QA / E2E: exercises the real user-facing flows across every
// configured browser project (chromium/firefox/webkit/mobile), so this
// suite doubles as the cross-browser test pass.
test.describe('FiWi V2 functional flows', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
  });

  test('loads the dashboard with navbar, sidebar and the passwords tab active by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'FiWi V2' })).toBeVisible();
    await expect(page.getByTitle('Ağı Sil').first()).toBeVisible();
  });

  test('switches tabs via the sidebar', async ({ page }) => {
    await page.getByRole('button', { name: /Güvenlik Analizi/i }).click();
    await expect(page.getByText('Ağ Güvenlik Skoru')).toBeVisible();

    await page.getByRole('button', { name: /Yakındaki Ağlar/i }).click();
    await expect(page.getByText('Kanal Çakışma Analizi')).toBeVisible();
  });

  test('searches saved networks by SSID', async ({ page }) => {
    await expect(page.getByText('HomeNetwork')).toBeVisible();
    await expect(page.getByText('CafeOpen')).toBeVisible();

    await page.getByPlaceholder('Ağ adı (SSID) ile ara...').fill('Cafe');

    await expect(page.getByText('CafeOpen')).toBeVisible();
    await expect(page.getByText('HomeNetwork')).toHaveCount(0);
  });

  test('reveals a saved password on demand', async ({ page }) => {
    await expect(page.getByText('SuperSecret123')).toHaveCount(0);
    await page.getByTitle('Şifreyi Göster').click();
    await expect(page.getByText('SuperSecret123')).toBeVisible();
  });

  test('opens the QR modal for a saved network', async ({ page }) => {
    await page.getByRole('button', { name: 'QR Kod' }).first().click();
    await expect(page.getByText('Mobil cihazınızın kamerası ile taratarak')).toBeVisible();
  });

  test('switches the UI language', async ({ page }) => {
    await expect(page.getByText('Kayıtlı Parolalar')).toBeVisible();
    await page.getByTitle('Switch Language').click();
    await expect(page.getByText('Saved Passwords')).toBeVisible();
  });
});
