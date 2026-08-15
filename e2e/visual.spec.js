const { test, expect } = require('@playwright/test');
const { mockApi } = require('./mock-api');

// Visual regression baselines. First run on a given project/OS combo
// generates the baseline PNG under e2e/visual.spec.js-snapshots/ and passes;
// subsequent runs diff against it. Only run against chromium — comparing
// pixel-level screenshots across browser engines produces noisy, unrelated
// diffs (font hinting, scrollbar rendering) that cross-browser functional
// tests already cover more reliably.
test.describe('Visual regression', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'chromium-desktop-only baseline');
  });

  test('passwords tab matches the visual baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await mockApi(page);
    await page.goto('/');
    await expect(page.getByText('HomeNetwork')).toBeVisible();

    await expect(page).toHaveScreenshot('passwords-tab.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02
    });
  });

  test('security audit tab matches the visual baseline', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await mockApi(page);
    await page.goto('/');
    await page.getByRole('button', { name: /Güvenlik Analizi/i }).click();
    await expect(page.getByText('Ağ Güvenlik Skoru')).toBeVisible();

    await expect(page).toHaveScreenshot('audit-tab.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02
    });
  });
});
