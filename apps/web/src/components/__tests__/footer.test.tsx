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
  it("renders the copyright and the X / Twitter link", () => {
    render(
      <LocaleProvider locale="en">
        <Footer />
      </LocaleProvider>,
    )
    expect(screen.getByText("© meoru")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /twitter/i }),
    ).toBeInTheDocument()
  })

  it("renders the copyright in Korean too", () => {
    render(
      <LocaleProvider locale="ko">
        <Footer />
      </LocaleProvider>,
    )
    expect(screen.getByText("© meoru")).toBeInTheDocument()
  })
})
