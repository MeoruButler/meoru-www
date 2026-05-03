import { test, expect, type Page } from "@playwright/test"

async function gotoHydrated(page: Page, path: string): Promise<void> {
  await page.goto(path)
  await page.waitForLoadState("networkidle")
}

test.describe("gallery", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test("renders the Lightroom shell with all primary regions", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    await expect(
      page.getByRole("navigation", { name: "Collections" })
    ).toBeVisible()
    await expect(page.getByRole("region", { name: "Filmstrip" })).toBeVisible()
    await expect(page.getByRole("region", { name: "Develop" })).toBeVisible()
    await expect(page.getByTestId("photo-viewer")).toBeVisible()
  })

  test("swaps the viewer when a different filmstrip thumbnail is clicked", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    const figure = page.getByRole("figure")
    const initialSrc = await figure.locator("img").first().getAttribute("src")

    const strip = page.getByRole("region", { name: "Filmstrip" })
    const thumbs = strip.getByRole("button")
    const thumbCount = await thumbs.count()
    expect(thumbCount).toBeGreaterThan(1)

    for (let i = 0; i < thumbCount; i += 1) {
      const candidate = thumbs.nth(i)
      const candidateLabel = await candidate.getAttribute("aria-current")
      if (candidateLabel === "true") continue
      await candidate.click()
      break
    }

    const nextSrc = await figure.locator("img").first().getAttribute("src")
    expect(nextSrc).not.toBe(initialSrc)
  })

  test("filters the filmstrip when a collection chip is activated", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    const sidebar = page.getByRole("navigation", { name: "Collections" })
    const buttons = sidebar.getByRole("button")
    const labels = await buttons.allTextContents()

    const filterableLabel = labels.find((label) => label.trim() !== "All")
    if (!filterableLabel) {
      throw new Error("expected at least one collection chip beyond 'All'")
    }

    const stripBefore = page.getByRole("region", { name: "Filmstrip" })
    const beforeCount = await stripBefore.getByRole("button").count()

    await sidebar
      .getByRole("button", { name: filterableLabel.trim(), exact: true })
      .first()
      .click()

    const afterCount = await page
      .getByRole("region", { name: "Filmstrip" })
      .getByRole("button")
      .count()

    expect(afterCount).toBeLessThanOrEqual(beforeCount)
  })

  test("updates the photo when the develop exposure slider is dragged", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    const img = page.getByRole("figure").locator("img").first()

    const exposure = page.getByLabel("Exposure", { exact: true })
    await exposure.fill("80")

    const filterValue = await img.evaluate(
      (el) => (el as HTMLImageElement).style.filter
    )
    expect(filterValue).toContain("brightness(1.4)")
  })

  test("toggles black & white via the photo viewer button", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    const img = page.getByRole("figure").locator("img").first()
    await page.getByRole("button", { name: "Toggle black and white" }).click()
    const filterValue = await img.evaluate(
      (el) => (el as HTMLImageElement).style.filter
    )
    expect(filterValue).toContain("grayscale(1)")
  })

  test("opens the metadata overlay when the info button is pressed", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    await expect(page.getByTestId("metadata-overlay")).toHaveCount(0)
    await page.getByRole("button", { name: "Toggle metadata overlay" }).click()
    const overlay = page.getByTestId("metadata-overlay")
    await expect(overlay).toBeVisible()
    await expect(overlay.getByText(/SONY|Sony/)).toBeVisible()
  })

  test("Konami code reveals the director's cut grain overlay", async ({
    page,
  }) => {
    await gotoHydrated(page, "/en")
    const sequence = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ]
    for (const key of sequence) {
      await page.keyboard.press(key)
    }
    await expect(page.getByTestId("directors-cut-overlay")).toBeVisible()
  })
})
