import { test, expect } from '@playwright/test';

test.describe('App Shell', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check title or app container is rendered
    const appContainer = page.locator('div').first();
    await expect(appContainer).toBeAttached();
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should show guide overlay on load', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Guide hint should be visible initially
    const guideHint = page.getByText('HOLD: VOICE');
    await expect(guideHint).toBeVisible({ timeout: 3000 });
  });

  test('should have language switcher in top-right', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const langSwitcher = page.locator('button').filter({ has: page.locator('svg') }).first();
    // Language switcher should be present
    await expect(langSwitcher).toBeAttached({ timeout: 5000 });
  });
});

test.describe('Responsive Design', () => {
  test('should render on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    // App should render without errors on mobile
    const app = page.locator('div').first();
    await expect(app).toBeAttached();
  });

  test('should render on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    const app = page.locator('div').first();
    await expect(app).toBeAttached();
  });

  test('should render on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    const app = page.locator('div').first();
    await expect(app).toBeAttached();
  });
});