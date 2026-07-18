import { test, expect } from '@playwright/test';

test.describe('Language Switcher', () => {
  test('should open language dropdown on click', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Find and click the language switcher button
    const langButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await langButton.click();
    await page.waitForTimeout(500);

    // Should show language options
    const englishOption = page.getByText('English');
    await expect(englishOption).toBeVisible({ timeout: 3000 });
  });

  test('should support switching to Chinese', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const langButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await langButton.click();
    await page.waitForTimeout(300);

    const zhCNOption = page.getByText('简体中文');
    await zhCNOption.click();
    await page.waitForTimeout(500);

    // Language switcher should now show 简体中文
    await expect(page.getByText('简体中文')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Service Worker', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Check that a service worker is registered
    const hasSW = await page.evaluate(async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    });
    expect(hasSW).toBe(true);
  });
});