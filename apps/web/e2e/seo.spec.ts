import { test, expect, type Page } from "@playwright/test"

async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await page.waitForLoadState("networkidle")
}

test.describe("seo", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test("renders OG and Twitter Card meta tags on the English landing", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    await expect(page).toHaveTitle("Meoru Butler")
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Personal site of @Meoru_butler"
    )
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Meoru Butler"
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "/og.png"
    )
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image"
    )
    await expect(page.locator('meta[name="twitter:site"]')).toHaveAttribute(
      "content",
      "@Meoru_butler"
    )
  })

  test("emits hreflang alternates for both locales", async ({ page }) => {
    await gotoHydrated(page, "/en")
    await expect(
      page.locator('link[rel="alternate"][hreflang="en"]')
    ).toHaveAttribute("href", "/en")
    await expect(
      page.locator('link[rel="alternate"][hreflang="ko"]')
    ).toHaveAttribute("href", "/ko")
    await expect(
      page.locator('link[rel="alternate"][hreflang="x-default"]')
    ).toHaveAttribute("href", "/en")
  })

  test("sets <html lang> and og:locale according to the route locale", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "en_US"
    )

    await gotoHydrated(page, "/ko")
    await expect(page.locator("html")).toHaveAttribute("lang", "ko")
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      "content",
      "ko_KR"
    )
  })

  test("serves manifest.json and og.png", async ({ request }) => {
    const manifest = await request.get("/manifest.json")
    expect(manifest.status()).toBe(200)
    const body = await manifest.json()
    expect(body.short_name).toBe("Meoru Butler")

    const og = await request.get("/og.png")
    expect(og.status()).toBe(200)
    expect(og.headers()["content-type"]).toContain("image/png")
  })
})
