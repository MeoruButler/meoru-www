import { test, expect, type Page } from "@playwright/test"

async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await page.waitForLoadState("networkidle")
}

test.describe("pages", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test("renders the English landing with the gallery shell", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    await expect(
      page.getByRole("navigation", { name: "Collections" })
    ).toBeVisible()
    await expect(page.getByRole("region", { name: "Filmstrip" })).toBeVisible()
    await expect(page.getByRole("figure")).toBeVisible()
  })

  test("renders the Korean landing with the localized collections label", async ({
    page,
  }) => {
    await gotoHydrated(page, "/ko")
    await expect(page.getByRole("navigation", { name: "컬렉션" })).toBeVisible()
    await expect(page.getByRole("region", { name: "필름스트립" })).toBeVisible()
  })

  test("renders the English Links page with the Twitter entry", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en/links")
    await expect(page.getByRole("heading", { name: "Links" })).toBeVisible()
    const twitter = page.getByRole("link", { name: /X \/ Twitter/ })
    await expect(twitter).toBeVisible()
    await expect(twitter).toHaveAttribute("href", "https://x.com/Meoru_butler")
    await expect(twitter).toHaveAttribute("target", "_blank")
  })

  test("renders the Korean Links page with the localized title", async ({
    page,
  }) => {
    await gotoHydrated(page, "/ko/links")
    await expect(page.getByRole("heading", { name: "링크" })).toBeVisible()
    await expect(page.getByText("여러 채널에서")).toBeVisible()
  })

  test("navigates from the header Links nav item to /links", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    await page.getByRole("link", { name: "Links", exact: true }).click()
    await expect(page).toHaveURL(/\/en\/links\/?$/)
    await expect(page.getByRole("heading", { name: "Links" })).toBeVisible()
  })

  test("navigates from the header Posts nav item to /posts", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    await page.getByRole("link", { name: "Posts", exact: true }).click()
    await expect(page).toHaveURL(/\/en\/posts\/?$/)
    await expect(page.getByRole("heading", { name: "Posts" })).toBeVisible()
  })
})
