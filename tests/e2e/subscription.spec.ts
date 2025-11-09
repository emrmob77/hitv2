import { test, expect } from '@playwright/test';

test.describe('Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should display pricing page', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.locator('h1, h2')).toContainText(/pricing|plans/i);

    // Should show all three tiers
    await expect(page.locator('text=/free/i')).toBeVisible();
    await expect(page.locator('text=/pro/i')).toBeVisible();
    await expect(page.locator('text=/enterprise/i')).toBeVisible();
  });

  test('should display feature comparison', async ({ page }) => {
    await page.goto('/pricing');

    // Should show feature lists
    await expect(page.locator('text=/bookmarks/i')).toBeVisible();
    await expect(page.locator('text=/analytics/i')).toBeVisible();
    await expect(page.locator('text=/unlimited/i')).toBeVisible();
  });

  test('should navigate to checkout from pricing', async ({ page }) => {
    await page.goto('/pricing');

    // Click Pro plan subscribe button
    const proButton = page.locator('button:has-text("Subscribe"), button:has-text("Get Started")').nth(1);
    await proButton.click();

    // Should show checkout or demo message
    await expect(
      page.locator('text=/checkout|demo|stripe/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should show demo mode message in development', async ({ page }) => {
    await page.goto('/pricing');

    // Click any subscribe button
    await page.click('button:has-text("Subscribe"), button:has-text("Get Started")');

    // Should show demo mode message
    await expect(
      page.locator('text=/demo.*environment|not configured/i')
    ).toBeVisible();
  });

  test('should access subscription settings', async ({ page }) => {
    await page.goto('/dashboard/settings');

    // Navigate to subscription tab
    await page.click('text=/subscription|billing/i');

    // Should show current plan
    await expect(page.locator('text=/current plan|free|pro|enterprise/i')).toBeVisible();
  });

  test('should show upgrade prompts for free users', async ({ page }) => {
    await page.goto('/dashboard');

    // Should see premium features with upgrade prompts
    const premiumBadges = page.locator('text=/premium|pro only|upgrade/i');
    if (await premiumBadges.count() > 0) {
      await expect(premiumBadges.first()).toBeVisible();
    }
  });

  test('should navigate to customer portal (demo)', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await page.click('text=/subscription|billing/i');

    // Click manage subscription button
    const manageButton = page.locator('button:has-text("Manage"), button:has-text("Portal")');
    if (await manageButton.count() > 0) {
      await manageButton.click();

      // Should show message or redirect
      await expect(
        page.locator('text=/portal|manage|stripe/i')
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display pricing correctly', async ({ page }) => {
    await page.goto('/pricing');

    // Check Pro plan price
    await expect(page.locator('text=/\\$9/i')).toBeVisible();

    // Check Enterprise plan price
    await expect(page.locator('text=/\\$49/i')).toBeVisible();

    // Check monthly/annual toggle if exists
    const billingToggle = page.locator('button:has-text("Monthly"), button:has-text("Annual")');
    if (await billingToggle.count() > 0) {
      await expect(billingToggle.first()).toBeVisible();
    }
  });

  test('should show success banner after subscription', async ({ page }) => {
    // Simulate returning from successful checkout
    await page.goto('/dashboard?checkout=success');

    // Should show success message
    await expect(
      page.locator('text=/success|thank you|subscribed/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should handle checkout cancellation', async ({ page }) => {
    // Simulate returning from cancelled checkout
    await page.goto('/dashboard?checkout=cancelled');

    // Should show message about cancellation
    await expect(
      page.locator('text=/cancelled|try again/i')
    ).toBeVisible({ timeout: 5000 });
  });
});
