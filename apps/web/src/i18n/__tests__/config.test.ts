import { describe, it, expect } from "vitest"
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  parseAcceptLanguage,
  parseLocale,
  parseLocaleFromCookie,
  parseLocaleFromCookieString,
  pickLocaleFromPathname,
  resolveLocale,
  serializeLocaleCookie,
  SUPPORTED_LOCALES,
  swapLocaleInPath,
} from "../config"

describe("i18n/config", () => {
  it("exposes the canonical locale tuple and defaults", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "ko"])
    expect(DEFAULT_LOCALE).toBe("en")
    expect(LOCALE_COOKIE_NAME).toBe("locale")
    expect(LOCALE_COOKIE_MAX_AGE).toBe(60 * 60 * 24 * 365)
  })

  describe("isLocale", () => {
    it("returns true for supported locales", () => {
      expect(isLocale("en")).toBe(true)
      expect(isLocale("ko")).toBe(true)
    })

    it("returns false for everything else", () => {
      expect(isLocale("ja")).toBe(false)
      expect(isLocale(undefined)).toBe(false)
      expect(isLocale(null)).toBe(false)
      expect(isLocale(0)).toBe(false)
    })
  })

  describe("parseLocale", () => {
    it("returns the locale when it is supported", () => {
      expect(parseLocale("ko")).toBe("ko")
    })

    it("returns undefined when the locale is missing or unsupported", () => {
      expect(parseLocale(undefined)).toBeUndefined()
      expect(parseLocale("ja")).toBeUndefined()
    })
  })

  describe("parseLocaleFromCookie", () => {
    it("delegates to parseLocale", () => {
      expect(parseLocaleFromCookie("en")).toBe("en")
      expect(parseLocaleFromCookie("xx")).toBeUndefined()
      expect(parseLocaleFromCookie(undefined)).toBeUndefined()
    })
  })

  describe("parseAcceptLanguage", () => {
    it("returns undefined for missing or empty headers", () => {
      expect(parseAcceptLanguage(undefined)).toBeUndefined()
      expect(parseAcceptLanguage("")).toBeUndefined()
    })

    it("picks the first supported locale ignoring quality and region", () => {
      expect(parseAcceptLanguage("ko-KR,ko;q=0.9,en;q=0.8")).toBe("ko")
      expect(parseAcceptLanguage("en-US, en;q=0.9")).toBe("en")
    })

    it("skips unsupported locales and returns undefined when none match", () => {
      expect(parseAcceptLanguage("fr-FR,fr;q=0.9")).toBeUndefined()
      expect(parseAcceptLanguage("ja,zh;q=0.5")).toBeUndefined()
    })

    it("falls back gracefully when an entry is malformed", () => {
      expect(parseAcceptLanguage(",;q=0.5,ko")).toBe("ko")
    })
  })

  describe("resolveLocale", () => {
    it("prefers the cookie when it is supported", () => {
      expect(resolveLocale({ cookie: "ko", acceptLanguage: "en" })).toBe("ko")
    })

    it("falls back to Accept-Language when no cookie is supplied", () => {
      expect(resolveLocale({ acceptLanguage: "ko-KR,ko;q=0.9" })).toBe("ko")
    })

    it("falls back to the default when nothing matches", () => {
      expect(resolveLocale({})).toBe("en")
      expect(resolveLocale({ cookie: "xx", acceptLanguage: "fr" })).toBe("en")
    })
  })

  describe("serializeLocaleCookie", () => {
    it("produces a Set-Cookie compatible string", () => {
      const cookie = serializeLocaleCookie("ko")
      expect(cookie).toContain("locale=ko")
      expect(cookie).toContain(`max-age=${LOCALE_COOKIE_MAX_AGE}`)
      expect(cookie).toContain("SameSite=Lax")
      expect(cookie).toContain("path=/")
    })
  })

  describe("pickLocaleFromPathname", () => {
    it("returns the first segment when it is a supported locale", () => {
      expect(pickLocaleFromPathname("/ko")).toBe("ko")
      expect(pickLocaleFromPathname("/ko/links")).toBe("ko")
      expect(pickLocaleFromPathname("/en")).toBe("en")
    })

    it("falls back to the default locale otherwise", () => {
      expect(pickLocaleFromPathname("/")).toBe("en")
      expect(pickLocaleFromPathname("")).toBe("en")
      expect(pickLocaleFromPathname("/somewhere")).toBe("en")
    })
  })

  describe("swapLocaleInPath", () => {
    it("returns just the locale segment for an empty path", () => {
      expect(swapLocaleInPath("/", "ko")).toBe("/ko")
      expect(swapLocaleInPath("", "en")).toBe("/en")
    })

    it("replaces the first path segment with the new locale", () => {
      expect(swapLocaleInPath("/en", "ko")).toBe("/ko")
      expect(swapLocaleInPath("/en/links", "ko")).toBe("/ko/links")
      expect(swapLocaleInPath("/ko/posts/123", "en")).toBe("/en/posts/123")
    })
  })

  describe("parseLocaleFromCookieString", () => {
    it("extracts the locale from a cookie string", () => {
      expect(parseLocaleFromCookieString("locale=ko")).toBe("ko")
      expect(parseLocaleFromCookieString("session=1; locale=en; ab=2")).toBe(
        "en"
      )
    })

    it("returns undefined when the cookie is missing or invalid", () => {
      expect(parseLocaleFromCookieString("")).toBeUndefined()
      expect(parseLocaleFromCookieString("locale=fr")).toBeUndefined()
    })

    it("returns undefined when decoding throws", () => {
      expect(parseLocaleFromCookieString("locale=%E0%A4%A")).toBeUndefined()
    })
  })
})
