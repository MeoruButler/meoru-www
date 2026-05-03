import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, renderHook, screen } from "@testing-library/react"
import { LocaleProvider } from "../locale-provider"
import { useLocale, useT } from "../use-locale"

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

function LocaleProbe() {
  const { locale, messages } = useLocale()
  const t = useT()
  return (
    <>
      <div data-testid="locale">{locale}</div>
      <div data-testid="hero-title">{messages.hero.title}</div>
      <div data-testid="t-hero-subtitle">{t.hero.subtitle}</div>
    </>
  )
}

describe("LocaleProvider + useLocale + useT", () => {
  beforeEach(() => {
    setupCookie()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("throws when useLocale is called without a provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderHook(() => useLocale())).toThrow(/LocaleProvider/)
    consoleError.mockRestore()
  })

  it("throws when useT is called without a provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderHook(() => useT())).toThrow(/LocaleProvider/)
    consoleError.mockRestore()
  })

  it("exposes the English dictionary when locale is en", () => {
    render(
      <LocaleProvider locale="en">
        <LocaleProbe />
      </LocaleProvider>
    )
    expect(screen.getByTestId("locale").textContent).toBe("en")
    expect(screen.getByTestId("hero-title").textContent).toBe("Meoru Butler")
    expect(screen.getByTestId("t-hero-subtitle").textContent).toBe(
      "Personal site of @Meoru_butler"
    )
  })

  it("exposes the Korean dictionary when locale is ko", () => {
    render(
      <LocaleProvider locale="ko">
        <LocaleProbe />
      </LocaleProvider>
    )
    expect(screen.getByTestId("locale").textContent).toBe("ko")
    expect(screen.getByTestId("hero-title").textContent).toBe("머루집사")
    expect(screen.getByTestId("t-hero-subtitle").textContent).toBe(
      "@Meoru_butler 개인 사이트"
    )
  })

  it("persists the locale to a cookie on mount", () => {
    render(
      <LocaleProvider locale="ko">
        <LocaleProbe />
      </LocaleProvider>
    )
    expect(cookieValue).toContain("locale=ko")
  })

  it("updates the cookie when the locale prop changes", () => {
    const { rerender } = render(
      <LocaleProvider locale="en">
        <LocaleProbe />
      </LocaleProvider>
    )
    expect(cookieValue).toContain("locale=en")
    rerender(
      <LocaleProvider locale="ko">
        <LocaleProbe />
      </LocaleProvider>
    )
    expect(cookieValue).toContain("locale=ko")
  })
})
