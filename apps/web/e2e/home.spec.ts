import { test, expect } from "@playwright/test"

test.describe("home page", () => {
  test("renders the project-ready landing with a button", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByRole("heading", { name: "Project ready!" })
    ).toBeVisible()
    await expect(page.getByRole("button", { name: "Button" })).toBeVisible()
  })

  test("uses the configured document title", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle("TanStack Start Starter")
  })

  test("returns a 404 page for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist")
    expect(response?.status()).toBe(404)
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible()
  })
})
