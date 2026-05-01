import { test, expect } from "@playwright/test"

const baseURL = `http://localhost:${process.env.E2E_PORT ?? 3000}`

test.describe("locale routing", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test("redirects '/' to /en when Accept-Language prefers English", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ locale: "en-US" })
    const page = await ctx.newPage()
    await page.goto("/")
    await expect(page).toHaveURL(/\/en\/?$/)
    await expect(page.getByRole("heading", { name: "meoru" })).toBeVisible()
    await ctx.close()
  })

  test("redirects '/' to /ko when Accept-Language prefers Korean", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ locale: "ko-KR" })
    const page = await ctx.newPage()
    await page.goto("/")
    await expect(page).toHaveURL(/\/ko\/?$/)
    await expect(page.getByRole("heading", { name: "메오루" })).toBeVisible()
    await ctx.close()
  })

  test("redirects '/' to the cookie locale when one is set", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ locale: "en-US" })
    await ctx.addCookies([
      { name: "locale", value: "ko", url: baseURL },
    ])
    const page = await ctx.newPage()
    await page.goto("/")
    await expect(page).toHaveURL(/\/ko\/?$/)
    await ctx.close()
  })

  test("renders the Korean hero on /ko", async ({ page }) => {
    await page.goto("/ko")
    await expect(page.getByRole("heading", { name: "메오루" })).toBeVisible()
    await expect(page.getByText("개인 사이트")).toBeVisible()
  })

  test("renders the English hero on /en", async ({ page }) => {
    await page.goto("/en")
    await expect(page.getByRole("heading", { name: "meoru" })).toBeVisible()
    await expect(page.getByText("Personal site")).toBeVisible()
  })

  test("returns a 404 for an unsupported locale", async ({ page }) => {
    const response = await page.goto("/zz")
    expect(response?.status()).toBe(404)
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible()
  })
})
