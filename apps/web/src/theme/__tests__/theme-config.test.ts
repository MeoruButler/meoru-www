import { describe, expect, it, vi } from "vitest"
import {
  DEFAULT_THEME,
  isTheme,
  parseTheme,
  parseThemeFromCookie,
  resolveTheme,
  serializeThemeCookie,
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  THEMES,
  themeInitScript,
} from "../theme-config"

describe("theme-config", () => {
  it("exposes the canonical theme tuple and defaults", () => {
    expect(THEMES).toEqual(["light", "dark", "system"])
    expect(DEFAULT_THEME).toBe("system")
    expect(THEME_COOKIE_NAME).toBe("theme")
    expect(THEME_COOKIE_MAX_AGE).toBe(60 * 60 * 24 * 365)
  })

  describe("isTheme", () => {
    it("accepts the three valid values", () => {
      expect(isTheme("light")).toBe(true)
      expect(isTheme("dark")).toBe(true)
      expect(isTheme("system")).toBe(true)
    })

    it("rejects everything else", () => {
      expect(isTheme("auto")).toBe(false)
      expect(isTheme(undefined)).toBe(false)
      expect(isTheme(null)).toBe(false)
      expect(isTheme(123)).toBe(false)
    })
  })

  describe("parseTheme", () => {
    it("returns the value when it is a valid theme", () => {
      expect(parseTheme("dark")).toBe("dark")
    })

    it("falls back to the default when the value is missing or invalid", () => {
      expect(parseTheme(undefined)).toBe("system")
      expect(parseTheme("nonsense")).toBe("system")
    })
  })

  describe("parseThemeFromCookie", () => {
    it("returns the default when no theme cookie exists", () => {
      expect(parseThemeFromCookie("")).toBe("system")
      expect(parseThemeFromCookie("session=abc; tracking=1")).toBe("system")
    })

    it("extracts the theme value from a cookie string", () => {
      expect(parseThemeFromCookie("theme=light")).toBe("light")
      expect(parseThemeFromCookie("session=abc; theme=dark; other=1")).toBe(
        "dark"
      )
      expect(parseThemeFromCookie("theme=system")).toBe("system")
    })

    it("falls back to the default when the cookie value is invalid", () => {
      expect(parseThemeFromCookie("theme=auto")).toBe("system")
    })

    it("falls back to the default when decoding throws", () => {
      expect(parseThemeFromCookie("theme=%E0%A4%A")).toBe("system")
    })
  })

  describe("resolveTheme", () => {
    it("returns the theme directly when it is light or dark", () => {
      expect(resolveTheme("light", true)).toBe("light")
      expect(resolveTheme("dark", false)).toBe("dark")
    })

    it("uses prefersDark when the theme is system", () => {
      expect(resolveTheme("system", true)).toBe("dark")
      expect(resolveTheme("system", false)).toBe("light")
    })
  })

  describe("serializeThemeCookie", () => {
    it("produces a Set-Cookie compatible string", () => {
      const cookie = serializeThemeCookie("dark")
      expect(cookie).toContain("theme=dark")
      expect(cookie).toContain(`max-age=${THEME_COOKIE_MAX_AGE}`)
      expect(cookie).toContain("SameSite=Lax")
      expect(cookie).toContain("path=/")
    })
  })

  describe("themeInitScript", () => {
    it("toggles the dark class based on cookie or prefers-color-scheme", () => {
      const cases = [
        { cookie: "theme=dark", prefers: false, expectDark: true },
        { cookie: "theme=light", prefers: true, expectDark: false },
        { cookie: "theme=system", prefers: true, expectDark: true },
        { cookie: "theme=system", prefers: false, expectDark: false },
        { cookie: "", prefers: true, expectDark: true },
        { cookie: "", prefers: false, expectDark: false },
      ]

      for (const { cookie, prefers, expectDark } of cases) {
        document.documentElement.classList.remove("dark")
        Object.defineProperty(document, "cookie", {
          configurable: true,
          get: () => cookie,
        })
        const matchMedia = vi.fn().mockReturnValue({ matches: prefers })
        vi.stubGlobal("matchMedia", matchMedia)
        new Function(themeInitScript)()
        expect(document.documentElement.classList.contains("dark")).toBe(
          expectDark
        )
        vi.unstubAllGlobals()
      }
    })

    it("swallows errors thrown inside the IIFE", () => {
      Object.defineProperty(document, "cookie", {
        configurable: true,
        get: () => {
          throw new Error("boom")
        },
      })
      expect(() => new Function(themeInitScript)()).not.toThrow()
      Object.defineProperty(document, "cookie", {
        configurable: true,
        value: "",
        writable: true,
      })
    })
  })
})
