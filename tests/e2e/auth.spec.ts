import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('h1')).toContainText(/sign in|log in/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('h1')).toContainText(/sign up|register/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without filling form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=/email.*required/i')).toBeVisible();
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');

    // Click register link
    await page.click('text=/sign up|create account/i');

    await expect(page).toHaveURL(/register/);

    // Navigate back to login
    await page.click('text=/sign in|log in/i');

    await expect(page).toHaveURL(/login/);
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in credentials (adjust based on test user)
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

    // Should see user profile or dashboard elements
    await expect(page.locator('text=/dashboard/i')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page, context }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);

    // Click logout (adjust selector based on your UI)
    await page.click('button:has-text("Logout"), button:has-text("Sign Out")');

    // Should redirect to home or login
    await expect(page).toHaveURL(/\/($|login)/);

    // Should not be able to access dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
