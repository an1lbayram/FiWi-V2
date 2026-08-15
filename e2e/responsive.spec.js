const { test, expect } = require('@playwright/test');
const { mockApi } = require('./mock-api');

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

test.describe('Responsive layout', () => {
  for (const { name, width, height } of viewports) {
    test(`no horizontal overflow at ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await mockApi(page);
      await page.goto('/');
      await expect(page.getByText('HomeNetwork')).toBeVisible();

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));

      // A couple of px of tolerance for sub-pixel rounding across engines.
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });
  }

  test('sidebar navigation stays usable at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockApi(page);
    await page.goto('/');

    await page.getByRole('button', { name: /Yakındaki Ağlar/i }).click();
    await expect(page.getByText('Kanal Çakışma Analizi')).toBeVisible();
  });
});
