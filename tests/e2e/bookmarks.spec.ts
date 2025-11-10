import { test, expect } from '@playwright/test';

test.describe('Bookmark Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should display bookmarks page', async ({ page }) => {
    await page.goto('/dashboard/bookmarks');

    await expect(page.locator('h1, h2')).toContainText(/bookmarks/i);
    await expect(page.locator('button:has-text("Add"), button:has-text("New")')).toBeVisible();
  });

  test('should create new bookmark', async ({ page }) => {
    await page.goto('/dashboard/bookmarks');

    // Click add bookmark button
    await page.click('button:has-text("Add"), button:has-text("New Bookmark")');

    // Fill in bookmark details
    await page.fill('input[name="url"], input[placeholder*="URL"]', 'https://example.com/test');
    await page.fill('input[name="title"], input[placeholder*="title"]', 'Test Bookmark');
    await page.fill('textarea[name="description"]', 'Test description for bookmark');

    // Submit form
    await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');

    // Should see success message or new bookmark in list
    await expect(
      page.locator('text=/Test Bookmark|success|created/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should validate bookmark URL', async ({ page }) => {
    await page.goto('/dashboard/bookmarks');

    await page.click('button:has-text("Add"), button:has-text("New Bookmark")');

    // Try invalid URL
    await page.fill('input[name="url"], input[placeholder*="URL"]', 'not-a-url');
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('text=/invalid.*url/i')).toBeVisible();
  });

  test('should edit existing bookmark', async ({ page }) => {
    await page.goto('/dashboard/bookmarks');

    // Click edit on first bookmark (adjust selector based on your UI)
    await page.click('button[aria-label*="Edit"]:first-of-type, [data-testid="edit-bookmark"]:first-of-type');

    // Update title
    await page.fill('input[name="title"]', 'Updated Bookmark Title');

    // Save changes
    await page.click('button[type="submit"]:has-text("Save")');

    // Should see updated title
    await expect(page.locator('text=Updated Bookmark Title')).toBeVisible();
  });

  test('should delete bookmark', async ({ page }) => {
    await page.goto('/dashboard/bookmarks');

    // Get initial bookmark count
    const bookmarksBefore = await page.locator('[data-testid="bookmark-item"], article').count();

    // Click delete on first bookmark
    await page.click('button[aria-label*="Delete"]:first-of-type, [data-testid="delete-bookmark"]:first-of-type');

    // Confirm deletion (if there's a confirmation dialog)
    await page.click('button:has-text("Delete"), button:has-text("Confirm")');

    // Should have one less bookmark
    await page.waitForTimeout(1000);
    const bookmarksAfter = await page.locator('[data-testid="bookmark-item"], article').count();
    expect(bookmarksAfter).toBe(bookmarksBefore - 1);
  });

  test('should filter bookmarks by collection', async ({ page }) => {
    await page.goto('/dashboard/bookmarks');

    // Click on a collection filter (adjust selector)
    await page.click('[data-testid="collection-filter"]:first-of-type, button:has-text("All")');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Should show filtered bookmarks
    await expect(page.locator('[data-testid="bookmark-item"]')).toBeVisible();
  });

  test('should search bookmarks', async ({ page }) => {
    await page.goto('/dashboard/bookmarks');

    // Type in search box
    await page.fill('input[type="search"], input[placeholder*="Search"]', 'test');

    // Wait for search results
    await page.waitForTimeout(500);

    // Should show search results
    await expect(page.locator('[data-testid="bookmark-item"], article')).toBeVisible();
  });

  test('should respect free tier bookmark limits', async ({ page, context }) => {
    // Assumes user is on free tier
    await page.goto('/dashboard/bookmarks');

    // Get current bookmark count
    const currentCount = await page.locator('[data-testid="bookmark-count"]').textContent();

    // If at limit (20), should show upgrade prompt
    if (currentCount?.includes('20')) {
      await page.click('button:has-text("Add"), button:has-text("New Bookmark")');

      await expect(
        page.locator('text=/upgrade|limit reached|premium/i')
      ).toBeVisible();
    }
  });
});
