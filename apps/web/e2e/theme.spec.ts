import { test, expect } from "@playwright/test"

const baseURL = `http://localhost:${process.env.E2E_PORT ?? 3000}`
const darkClass = /(?:^|\s)dark(?:\s|$)/

test.describe("theme", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test("applies the dark class when the theme cookie is set to dark", async ({
    page,
    context,
  }) => {
    await context.addCookies([{ name: "theme", value: "dark", url: baseURL }])
    await page.emulateMedia({ colorScheme: "light" })
    await page.goto("/")
    await expect(page.locator("html")).toHaveClass(darkClass)
  })

  test("does not apply the dark class when the theme cookie is set to light", async ({
    page,
    context,
  }) => {
    await context.addCookies([{ name: "theme", value: "light", url: baseURL }])
    await page.emulateMedia({ colorScheme: "dark" })
    await page.goto("/")
    const cls = (await page.locator("html").getAttribute("class")) ?? ""
    expect(cls).not.toMatch(darkClass)
  })

  test("uses prefers-color-scheme when no theme cookie is set", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" })
    await page.goto("/")
    await expect(page.locator("html")).toHaveClass(darkClass)

    await page.emulateMedia({ colorScheme: "light" })
    await page.waitForFunction(
      () => !document.documentElement.classList.contains("dark")
    )
  })
})
