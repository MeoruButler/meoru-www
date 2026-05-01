import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"

let mockedPathname = "/en"

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>(
      "@tanstack/react-router"
    )
  return {
    ...actual,
    HeadContent: () => null,
    Scripts: () => null,
    useRouterState: ({
      select,
    }: {
      select: (state: { location: { pathname: string } }) => unknown
    }) => select({ location: { pathname: mockedPathname } }),
  }
})

const { NotFound, Route, RootDocument, head } = await import("./__root")

describe("routes/__root", () => {
  it("registers the root route", () => {
    expect(Route).toBeDefined()
  })

  it("provides head metadata with site title, description, OG, and hreflang links", () => {
    const result = head()
    expect(result.meta).toEqual(
      expect.arrayContaining([
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "Meoru Butler" },
        { name: "description", content: "Personal site of @Meoru_butler" },
        { property: "og:image", content: "/og.png" },
        { name: "twitter:card", content: "summary_large_image" },
      ])
    )
    expect(result.links).toEqual(
      expect.arrayContaining([
        { rel: "stylesheet", href: expect.any(String) },
        { rel: "alternate", hrefLang: "en", href: "/en" },
        { rel: "alternate", hrefLang: "ko", href: "/ko" },
        { rel: "alternate", hrefLang: "x-default", href: "/en" },
      ])
    )
  })

  it("renders the 404 not-found component", () => {
    render(<NotFound />)
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument()
    expect(
      screen.getByText("The requested page could not be found.")
    ).toBeInTheDocument()
  })

  it("renders the HTML shell with the path-derived lang attribute", () => {
    mockedPathname = "/ko/links"
    const html = renderToStaticMarkup(
      <RootDocument>
        <div data-testid="page">page-body</div>
      </RootDocument>
    )
    expect(html).toContain('lang="ko"')
    expect(html).toContain("<body>")
    expect(html).toContain("page-body")
  })

  it("falls back to the default locale when the path is not localized", () => {
    mockedPathname = "/"
    const html = renderToStaticMarkup(
      <RootDocument>
        <div data-testid="page">page-body</div>
      </RootDocument>
    )
    expect(html).toContain('lang="en"')
  })
})
