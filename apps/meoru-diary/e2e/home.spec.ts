import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Sticker book', () => {
  test('renders the notebook shell with the first page of stickers', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle('Meoru — fursuit photo diary');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1, name: 'Meoru' })).toBeVisible();

    const stickers = page.locator('figure.sticker');
    await expect(stickers).toHaveCount(12);

    // Every sticker reserves its box up front: intrinsic size on the img, aspect ratio on the frame.
    const images = page.locator('figure.sticker img[alt]:not([aria-hidden])');
    for (const image of await images.all()) {
      await expect(image).toHaveAttribute('width', /\d+/);
      await expect(image).toHaveAttribute('height', /\d+/);
      await expect(image).toHaveAttribute('sizes', /vw/);
    }
    await expect(images.first()).toHaveAttribute('fetchpriority', 'high');
    await expect(images.nth(5)).not.toHaveAttribute('fetchpriority', 'high');

    // The optimizer must actually deliver bytes: a decoded image has a natural width, and the frame
    // flips to loaded so the placeholder is hidden behind the real photo.
    await expect.poll(() => images.first().evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator('figure.sticker .sticker-frame').first()).toHaveAttribute('data-loaded', 'true');
  });

  test('appends stickers while scrolling until the book is complete', async ({ page }) => {
    await page.goto('/en');
    const stickers = page.locator('figure.sticker');
    await expect(stickers).toHaveCount(12);
    await expect(page.getByRole('status')).toHaveText('12 of 18 photos shown');

    await page.mouse.wheel(0, 20_000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(stickers).toHaveCount(18);
    await expect(page.getByTestId('sticker-book-sentinel')).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText('End of the book');
  });

  test('bookmarks jump to their chapter and reveal its stickers', async ({ page }) => {
    await page.goto('/en');
    const nav = page.getByRole('navigation', { name: 'Chapters' });
    await expect(nav.getByRole('link')).toHaveText(['spring drive', 'midsummer streets', 'late light', 'About']);

    await nav.getByRole('link', { name: 'late light' }).click();
    await expect(page).toHaveURL(/#late-light$/);
    const section = page.locator('section#late-light');
    await expect(section).toBeInViewport();
    await expect(section.locator('figure.sticker')).toHaveCount(5);
    await expect(nav.getByRole('link', { name: 'late light' })).toHaveAttribute('aria-current', 'location');
  });

  test('loads the stickers of a deep-linked chapter', async ({ page }) => {
    await page.goto('/en#midsummer-streets');
    await expect(page.locator('section#midsummer-streets figure.sticker')).toHaveCount(6);
  });
});

test.describe('Keyboard and screen reader support', () => {
  test('the skip link is the first tab stop and moves focus to the photos', async ({ page }) => {
    await page.goto('/en');
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to photos' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main#main')).toBeFocused();
  });

  test('the whole book can be read with the button alone when scrolling does not reveal it', async ({ page }) => {
    // Simulate a client where scroll-based revealing never fires (no IntersectionObserver callbacks).
    await page.addInitScript(() => {
      class InertObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      }
      Object.defineProperty(window, 'IntersectionObserver', { value: InertObserver });
    });
    await page.goto('/en');
    const showMore = page.getByRole('button', { name: 'Show more photos' });
    await showMore.focus();
    await expect(showMore).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('figure.sticker')).toHaveCount(18);
    await expect(page.getByRole('status')).toHaveText('End of the book');
    await expect(showMore).toHaveCount(0);
  });

  test('bookmarks are reachable by keyboard and hand focus to the chapter', async ({ page }) => {
    await page.goto('/en');
    const bookmark = page.getByRole('navigation', { name: 'Chapters' }).getByRole('link', { name: 'late light' });
    await bookmark.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('section#late-light')).toBeFocused();
  });

  test('has no detectable WCAG 2.2 AA violations', async ({ page }) => {
    await page.goto('/en');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('Localization', () => {
  test('redirects the root to the device language and remembers a manual choice', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'ko-KR' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/ko$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    await expect(page.getByRole('navigation', { name: '챕터' })).toBeVisible();

    await page.getByRole('navigation', { name: '언어' }).getByRole('link', { name: '日本語' }).click();
    await expect(page).toHaveURL(/\/ja$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    await expect(page.getByRole('link', { name: '日本語' })).toHaveAttribute('aria-current', 'page');

    await page.goto('/');
    await expect(page).toHaveURL(/\/ja$/);
    await context.close();
  });

  test('falls back to English for unsupported languages', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'fr-FR' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await context.close();
  });

  test('marks untranslated manifest text with its own language on non-English pages', async ({ page }) => {
    await page.goto('/ko');
    await expect(page).toHaveTitle('Meoru — 퍼슈트 사진 일기');
    await expect(page.getByRole('heading', { level: 2, name: 'spring drive' })).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('navigation', { name: '챕터' }).getByRole('link', { name: 'late light' })
    ).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('navigation', { name: '챕터' }).getByRole('link', { name: '소개' })
    ).not.toHaveAttribute('lang', /.+/);
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 2, name: 'spring drive' })).not.toHaveAttribute('lang', /.+/);
  });

  test('uses Simplified Chinese for zh requests', async ({ page }) => {
    await page.goto('/zh');
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hans');
    await expect(page.getByRole('heading', { level: 2, name: '关于' })).toBeAttached();
  });
});

test.describe('Not Found Page', () => {
  test('renders a localized 404 with a link back home', async ({ page }) => {
    const response = await page.goto('/ko/this-route-does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    await expect(page.getByRole('heading', { name: '페이지를 찾을 수 없습니다' })).toBeVisible();

    await page.getByRole('link', { name: '홈으로' }).click();
    await expect(page).toHaveURL(/\/ko$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Meoru' })).toBeVisible();
  });

  test('routes unknown top-level paths through the locale redirect', async ({ page }) => {
    const response = await page.goto('/nope');
    expect(response?.status()).toBe(404);
    await expect(page).toHaveURL(/\/en\/nope$/);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });
});
