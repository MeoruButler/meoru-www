import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { App, Route } from "./index"

describe("routes/index", () => {
  it("registers a file route", () => {
    expect(Route).toBeDefined()
  })

  it("renders the App with heading and button", () => {
    render(<App />)
    expect(
      screen.getByRole("heading", { name: "Project ready!" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Button" })).toBeInTheDocument()
  })
})
