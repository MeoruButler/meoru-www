import { expect, test } from '@playwright/test';

test.describe('Home Page', () => {
  test('displays the heading and counter', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Meoru Next' })).toBeVisible();
    await expect(page.getByText('Count: 0')).toBeVisible();
  });

  test('increments the counter', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '+' }).click();
    await expect(page.getByText('Count: 1')).toBeVisible();
  });
});
