import { test, expect, type Page } from "@playwright/test"

async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await page.waitForLoadState("networkidle")
}

test.describe("layout", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test.describe("desktop", () => {
    test("renders the header logo, nav link, and footer copyright", async ({
      page,
    }) => {
      await gotoHydrated(page, "/en")
      await expect(page.getByRole("link", { name: "meoru" })).toBeVisible()
      await expect(
        page.getByRole("link", { name: "Home", exact: true }),
      ).toBeVisible()
      await expect(page.getByText("© meoru")).toBeVisible()
    })

    test("toggles the dark class through the theme menu", async ({ page }) => {
      await page.emulateMedia({ colorScheme: "light" })
      await gotoHydrated(page, "/en")
      await page.getByRole("button", { name: "Theme" }).first().click()
      await page.getByRole("menuitem", { name: "Dark" }).click()
      await expect(page.locator("html")).toHaveClass(/(?:^|\s)dark(?:\s|$)/)

      await page.getByRole("button", { name: "Theme" }).first().click()
      await page.getByRole("menuitem", { name: "Light" }).click()
      await page.waitForFunction(
        () => !document.documentElement.classList.contains("dark"),
      )
    })

    test("switches the URL and dictionary via the language menu", async ({
      page,
    }) => {
      await gotoHydrated(page, "/en")
      await page.getByRole("button", { name: "Language" }).first().click()
      await page.getByRole("menuitem", { name: "Korean" }).click()
      await expect(page).toHaveURL(/\/ko\/?$/)
      await expect(page.getByRole("heading", { name: "메오루" })).toBeVisible()
    })
  })

  test.describe("mobile", () => {
    test("hides the desktop nav and reveals the home link via the Sheet", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await gotoHydrated(page, "/en")
      await page.getByRole("button", { name: "Open menu" }).click()
      const dialog = page.getByRole("dialog")
      await expect(dialog).toBeVisible()
      await expect(
        dialog.getByRole("link", { name: "Home", exact: true }),
      ).toBeVisible()
    })
  })
})
