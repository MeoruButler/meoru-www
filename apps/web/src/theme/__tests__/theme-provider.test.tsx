import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { act, render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "../theme-provider"
import { useTheme } from "../use-theme"
import type { Theme } from "../theme-config"

type Listener = () => void

function setupMatchMedia(initialMatches: boolean) {
  const listeners = new Set<Listener>()
  const mql = {
    matches: initialMatches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: (_: string, fn: Listener) => listeners.add(fn),
    removeEventListener: (_: string, fn: Listener) => {
      listeners.delete(fn)
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: () => true,
  }
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(mql))
  return {
    listeners,
    fire(matches: boolean) {
      mql.matches = matches
      for (const fn of listeners) fn()
    },
  }
}

let cookieValue = ""
function setupCookie(initial = "") {
  cookieValue = initial
  Object.defineProperty(document, "cookie", {
    configurable: true,
    get: () => cookieValue,
    set: (next: string) => {
      cookieValue = next
    },
  })
}

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <>
      <div data-testid="theme">{theme}</div>
      <div data-testid="resolved">{resolvedTheme}</div>
      {(["light", "dark", "system"] as Theme[]).map((t) => (
        <button key={t} data-testid={`set-${t}`} onClick={() => setTheme(t)}>
          {t}
        </button>
      ))}
    </>
  )
}

describe("ThemeProvider + useTheme", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark")
    setupCookie("")
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("throws when useTheme is called without a provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/)
    consoleError.mockRestore()
  })

  it("starts with the system default and reads no cookie", () => {
    setupMatchMedia(false)
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )
    expect(screen.getByTestId("theme").textContent).toBe("system")
    expect(screen.getByTestId("resolved").textContent).toBe("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("hydrates from the theme cookie on mount", () => {
    setupCookie("theme=dark")
    setupMatchMedia(false)
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )
    expect(screen.getByTestId("theme").textContent).toBe("dark")
    expect(screen.getByTestId("resolved").textContent).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("applies the dark class when system prefers dark", () => {
    setupMatchMedia(true)
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )
    expect(screen.getByTestId("resolved").textContent).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("setTheme writes a cookie and toggles the html class", async () => {
    setupMatchMedia(false)
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )

    await user.click(screen.getByTestId("set-dark"))
    expect(screen.getByTestId("theme").textContent).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.cookie).toContain("theme=dark")

    await user.click(screen.getByTestId("set-light"))
    expect(screen.getByTestId("theme").textContent).toBe("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(document.cookie).toContain("theme=light")
  })

  it("reacts to prefers-color-scheme changes while in system mode", () => {
    const media = setupMatchMedia(false)
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )
    expect(screen.getByTestId("resolved").textContent).toBe("light")

    act(() => media.fire(true))
    expect(screen.getByTestId("resolved").textContent).toBe("dark")
    expect(document.documentElement.classList.contains("dark")).toBe(true)

    act(() => media.fire(false))
    expect(screen.getByTestId("resolved").textContent).toBe("light")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("falls back to the default when reading the cookie throws", () => {
    setupMatchMedia(false)
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => {
        throw new Error("ssr")
      },
    })
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )
    expect(screen.getByTestId("theme").textContent).toBe("system")
  })

  it("removes the prefers-color-scheme listener on unmount", () => {
    const media = setupMatchMedia(false)
    const { unmount } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>
    )
    expect(media.listeners.size).toBe(1)
    unmount()
    expect(media.listeners.size).toBe(0)
  })
})
