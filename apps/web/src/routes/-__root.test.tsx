import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { renderToStaticMarkup } from "react-dom/server"

vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>(
      "@tanstack/react-router"
    )
  return {
    ...actual,
    HeadContent: () => null,
    Scripts: () => null,
  }
})

const { NotFound, Route, RootDocument, head } = await import("./__root")

describe("routes/__root", () => {
  it("registers the root route", () => {
    expect(Route).toBeDefined()
  })

  it("provides head metadata with charset, viewport, title, and stylesheet", () => {
    const result = head()
    expect(result.meta).toEqual(
      expect.arrayContaining([
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "TanStack Start Starter" },
      ])
    )
    expect(result.links).toEqual([
      { rel: "stylesheet", href: expect.any(String) },
    ])
  })

  it("renders the 404 not-found component", () => {
    render(<NotFound />)
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument()
    expect(
      screen.getByText("The requested page could not be found.")
    ).toBeInTheDocument()
  })

  it("renders the HTML shell with children", () => {
    const html = renderToStaticMarkup(
      <RootDocument>
        <div data-testid="page">page-body</div>
      </RootDocument>
    )
    expect(html).toContain('<html lang="en">')
    expect(html).toContain("<body>")
    expect(html).toContain("page-body")
  })
})
