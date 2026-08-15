const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { mockApi } = require('./mock-api');

test.describe('Accessibility', () => {
  test('passwords tab has no serious/critical axe violations', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    await expect(page.getByText('HomeNetwork')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousOrWorse = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    expect(seriousOrWorse, JSON.stringify(seriousOrWorse, null, 2)).toEqual([]);
  });

  test('security audit tab has no serious/critical axe violations', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    await page.getByRole('button', { name: /Güvenlik Analizi/i }).click();
    await expect(page.getByText('Ağ Güvenlik Skoru')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousOrWorse = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    expect(seriousOrWorse, JSON.stringify(seriousOrWorse, null, 2)).toEqual([]);
  });
});
