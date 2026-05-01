import { test, expect, type Page, type BrowserContext } from "@playwright/test"

async function stubWidgetsJs(context: BrowserContext): Promise<void> {
  await context.route("**/platform.twitter.com/widgets.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "window.twttr = { widgets: { load: function () {} } };",
    }),
  )
}

async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await page.waitForLoadState("networkidle")
}

test.describe("tweet embed", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
    await stubWidgetsJs(context)
  })

  test("renders a blockquote for each configured tweet on the landing", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await gotoHydrated(page, "/en")

    const embeds = page.locator("[data-testid='tweet-embed']")
    await expect(embeds).toHaveCount(2)

    const firstQuote = embeds.first().locator("blockquote.twitter-tweet")
    await expect(firstQuote).toBeAttached()
    await expect(firstQuote).toHaveAttribute("data-lang", "en")
    await expect(firstQuote).toHaveAttribute("data-theme", "light")
    await expect(firstQuote.locator("a")).toHaveAttribute(
      "href",
      /twitter\.com\/Meoru_butler\/status\//,
    )
  })

  test("updates data-theme when the theme menu toggles dark", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" })
    await gotoHydrated(page, "/en")

    const blockquote = page
      .locator("[data-testid='tweet-embed'] blockquote.twitter-tweet")
      .first()
    await expect(blockquote).toHaveAttribute("data-theme", "light")

    await page.getByRole("button", { name: "Theme" }).first().click()
    await page.getByRole("menuitem", { name: "Dark" }).click()

    await expect(
      page
        .locator("[data-testid='tweet-embed'] blockquote.twitter-tweet")
        .first(),
    ).toHaveAttribute("data-theme", "dark")
  })

  test("updates data-lang when the language menu switches to Korean", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    const initial = page
      .locator("[data-testid='tweet-embed'] blockquote.twitter-tweet")
      .first()
    await expect(initial).toHaveAttribute("data-lang", "en")

    await page.getByRole("button", { name: "Language" }).first().click()
    await page.getByRole("menuitem", { name: "Korean" }).click()
    await expect(page).toHaveURL(/\/ko\/?$/)

    await expect(
      page
        .locator("[data-testid='tweet-embed'] blockquote.twitter-tweet")
        .first(),
    ).toHaveAttribute("data-lang", "ko")
  })

  test("loads widgets.js exactly once even when multiple embeds render", async ({
    page,
  }) => {
    const requests: string[] = []
    page.on("request", (req) => {
      if (req.url().includes("platform.twitter.com/widgets.js")) {
        requests.push(req.url())
      }
    })
    await gotoHydrated(page, "/en")
    expect(requests.length).toBeLessThanOrEqual(1)
  })
})
