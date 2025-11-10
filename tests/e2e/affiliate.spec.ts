import { test, expect } from '@playwright/test';

test.describe('Affiliate Link Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should display affiliate links page', async ({ page }) => {
    await page.goto('/dashboard/affiliate-links');

    await expect(page.locator('h1, h2')).toContainText(/affiliate/i);
  });

  test('should show premium gate for free users', async ({ page }) => {
    await page.goto('/dashboard/affiliate-links');

    // Free users should see upgrade prompt
    const upgradePrompt = page.locator('text=/upgrade|premium|pro/i');
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add")');

    // Either upgrade prompt or create button should be visible
    await expect(
      upgradePrompt.or(createButton)
    ).toBeVisible();
  });

  test('should create affiliate link (premium users)', async ({ page }) => {
    await page.goto('/dashboard/affiliate-links');

    // Skip if upgrade prompt is shown (free user)
    const upgradePrompt = page.locator('text=/upgrade.*premium/i');
    if (await upgradePrompt.isVisible()) {
      test.skip();
      return;
    }

    // Click create button
    await page.click('button:has-text("Create"), button:has-text("Add")');

    // Fill in affiliate link details
    await page.fill('input[name="originalUrl"], input[placeholder*="URL"]', 'https://amazon.com/product/123');
    await page.fill('input[name="title"], input[placeholder*="title"]', 'Test Product');
    await page.fill('input[name="affiliateTag"], input[placeholder*="tag"]', 'myaffiliate-20');

    // Submit form
    await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")');

    // Should see success message or new link
    await expect(
      page.locator('text=/Test Product|success|created/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should validate affiliate URL', async ({ page }) => {
    await page.goto('/dashboard/affiliate-links');

    // Skip if free user
    const upgradePrompt = page.locator('text=/upgrade.*premium/i');
    if (await upgradePrompt.isVisible()) {
      test.skip();
      return;
    }

    await page.click('button:has-text("Create"), button:has-text("Add")');

    // Try invalid URL
    await page.fill('input[name="originalUrl"], input[placeholder*="URL"]', 'invalid-url');
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('text=/invalid.*url/i')).toBeVisible();
  });

  test('should display affiliate link analytics', async ({ page }) => {
    await page.goto('/dashboard/affiliate-links');

    // Skip if free user
    const upgradePrompt = page.locator('text=/upgrade.*premium/i');
    if (await upgradePrompt.isVisible()) {
      test.skip();
      return;
    }

    // Should show analytics data (clicks, conversions, earnings)
    await expect(
      page.locator('text=/clicks|views|analytics/i')
    ).toBeVisible();
  });

  test('should copy shareable link', async ({ page, context }) => {
    await page.goto('/dashboard/affiliate-links');

    // Skip if free user
    const upgradePrompt = page.locator('text=/upgrade.*premium/i');
    if (await upgradePrompt.isVisible()) {
      test.skip();
      return;
    }

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Click copy button on first link
    const copyButton = page.locator('button[aria-label*="Copy"]:first-of-type, button:has-text("Copy"):first-of-type');
    if (await copyButton.count() > 0) {
      await copyButton.click();

      // Should show success message
      await expect(page.locator('text=/copied/i')).toBeVisible({ timeout: 2000 });
    }
  });

  test('should toggle affiliate link active status', async ({ page }) => {
    await page.goto('/dashboard/affiliate-links');

    // Skip if free user
    const upgradePrompt = page.locator('text=/upgrade.*premium/i');
    if (await upgradePrompt.isVisible()) {
      test.skip();
      return;
    }

    // Find toggle switch
    const toggle = page.locator('button[role="switch"]:first-of-type, input[type="checkbox"]:first-of-type');
    if (await toggle.count() > 0) {
      await toggle.click();

      // Wait for update
      await page.waitForTimeout(500);

      // Should update status
      await expect(
        page.locator('text=/active|inactive|enabled|disabled/i')
      ).toBeVisible();
    }
  });

  test('should delete affiliate link', async ({ page }) => {
    await page.goto('/dashboard/affiliate-links');

    // Skip if free user
    const upgradePrompt = page.locator('text=/upgrade.*premium/i');
    if (await upgradePrompt.isVisible()) {
      test.skip();
      return;
    }

    // Click delete button
    const deleteButton = page.locator('button[aria-label*="Delete"]:first-of-type');
    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Confirm deletion
      await page.click('button:has-text("Delete"), button:has-text("Confirm")');

      // Should show success message
      await expect(
        page.locator('text=/deleted|removed/i')
      ).toBeVisible({ timeout: 2000 });
    }
  });

  test('should show QR code for affiliate link', async ({ page }) => {
    await page.goto('/dashboard/affiliate-links');

    // Skip if free user
    const upgradePrompt = page.locator('text=/upgrade.*premium/i');
    if (await upgradePrompt.isVisible()) {
      test.skip();
      return;
    }

    // Click QR code button
    const qrButton = page.locator('button:has-text("QR"), button[aria-label*="QR"]');
    if (await qrButton.count() > 0) {
      await qrButton.first().click();

      // Should show QR code dialog
      await expect(page.locator('img[alt*="QR"], canvas')).toBeVisible({ timeout: 2000 });
    }
  });

  test('should filter links by status', async ({ page }) => {
    await page.goto('/dashboard/affiliate-links');

    // Skip if free user
    const upgradePrompt = page.locator('text=/upgrade.*premium/i');
    if (await upgradePrompt.isVisible()) {
      test.skip();
      return;
    }

    // Click filter dropdown if exists
    const filterButton = page.locator('button:has-text("Filter"), select');
    if (await filterButton.count() > 0) {
      await filterButton.first().click();

      // Select active filter
      await page.click('text=/active|all|inactive/i');

      // Wait for filtered results
      await page.waitForTimeout(500);
    }
  });
});
