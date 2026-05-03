import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { LocaleProvider } from "@/i18n/locale-provider"
import { Footer } from "../layout/footer"

let cookieValue = ""

beforeEach(() => {
  cookieValue = ""
  Object.defineProperty(document, "cookie", {
    configurable: true,
    get: () => cookieValue,
    set: (next: string) => {
      cookieValue = next
    },
  })
})

describe("Footer", () => {
  it("renders the English copyright and the Twitter handle link", () => {
    render(
      <LocaleProvider locale="en">
        <Footer />
      </LocaleProvider>
    )
    expect(screen.getByText("© Meoru Butler")).toBeInTheDocument()
    const link = screen.getByRole("link", { name: "@Meoru_butler" })
    expect(link).toHaveAttribute("href", "https://x.com/Meoru_butler")
  })

  it("renders the Korean copyright", () => {
    render(
      <LocaleProvider locale="ko">
        <Footer />
      </LocaleProvider>
    )
    expect(screen.getByText("© 머루집사")).toBeInTheDocument()
  })
})
