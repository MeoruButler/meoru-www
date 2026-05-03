import { test, expect } from "@playwright/test"

test.describe("home page", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test("redirects '/' to the default locale landing", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/(en|ko)\/?$/)
    await expect(page.getByRole("region", { name: "Filmstrip" })).toBeVisible()
  })

  test("uses the configured document title", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle("Meoru Butler")
  })

  test("returns a 404 page for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist")
    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole("heading", { name: "Reel 404 — Frame Missing" })
    ).toBeVisible()
  })
})
