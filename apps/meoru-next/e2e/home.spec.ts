import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('displays the heading and counter', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Meoru Next');
    await expect(page.getByRole('heading', { name: 'Meoru Next' })).toBeVisible();
    await expect(page.getByText('Count: 0')).toBeVisible();
    await expect(page.locator('body')).toHaveCSS('font-family', /Geist Variable/);
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from(document.fonts).some(font => font.family === 'Geist Variable' && font.status === 'loaded')
        )
      )
      .toBe(true);
  });

  test('increments the counter', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
  });

  test('follows the system color scheme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');

    await page.emulateMedia({ colorScheme: 'light' });

    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  });
});

test.describe('Not Found Page', () => {
  test('renders the 404 page with a link back home', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

    await page.getByRole('link', { name: 'Back to home' }).click();

    await expect(page.getByRole('heading', { name: 'Meoru Next' })).toBeVisible();
  });
});
