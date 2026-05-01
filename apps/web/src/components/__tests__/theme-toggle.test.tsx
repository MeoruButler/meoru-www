import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LocaleProvider } from "@/i18n/locale-provider"
import { ThemeProvider } from "@/theme/theme-provider"
import { ThemeToggle } from "../layout/theme-toggle"

let cookieValue = ""

function setupCookie() {
  cookieValue = ""
  Object.defineProperty(document, "cookie", {
    configurable: true,
    get: () => cookieValue,
    set: (next: string) => {
      cookieValue = next
    },
  })
}

function setupMatchMedia(initialMatches: boolean) {
  const listeners = new Set<() => void>()
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: initialMatches,
      media: "(prefers-color-scheme: dark)",
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => {
        listeners.delete(fn)
      },
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: () => true,
    }),
  )
}

function renderToggle() {
  return render(
    <ThemeProvider>
      <LocaleProvider locale="en">
        <ThemeToggle />
      </LocaleProvider>
    </ThemeProvider>,
  )
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark")
    setupCookie()
    setupMatchMedia(false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renders an accessible trigger labelled 'Theme'", () => {
    renderToggle()
    expect(screen.getByRole("button", { name: "Theme" })).toBeInTheDocument()
  })

  it("applies the dark theme when 'Dark' is selected", async () => {
    const user = userEvent.setup()
    renderToggle()
    await user.click(screen.getByRole("button", { name: "Theme" }))
    const darkItem = await screen.findByRole("menuitem", { name: /dark/i })
    await user.click(darkItem)
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(cookieValue).toContain("theme=dark")
  })

  it("applies the light theme when 'Light' is selected", async () => {
    const user = userEvent.setup()
    renderToggle()
    await user.click(screen.getByRole("button", { name: "Theme" }))
    const lightItem = await screen.findByRole("menuitem", { name: /light/i })
    await user.click(lightItem)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(cookieValue).toContain("theme=light")
  })

  it("applies the system theme when 'System' is selected", async () => {
    const user = userEvent.setup()
    renderToggle()
    await user.click(screen.getByRole("button", { name: "Theme" }))
    const systemItem = await screen.findByRole("menuitem", { name: /system/i })
    await user.click(systemItem)
    expect(cookieValue).toContain("theme=system")
  })
})
