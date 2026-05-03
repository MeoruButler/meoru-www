import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import { DirectorsCutProvider } from "@/lib/directors-cut-context"
import { CinephileEasterEggs } from "../easter-eggs"

const KONAMI_KEYS = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
]

function dispatchKey(key: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key }))
}

function renderEasterEggs() {
  return render(
    <DirectorsCutProvider>
      <CinephileEasterEggs />
    </DirectorsCutProvider>
  )
}

describe("CinephileEasterEggs", () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
  })
  afterEach(() => {
    logSpy.mockRestore()
  })

  it("logs a console quote on mount and hides the overlay by default", () => {
    renderEasterEggs()
    expect(logSpy).toHaveBeenCalled()
    expect(screen.queryByTestId("directors-cut-overlay")).toBeNull()
  })

  it("reveals the director's cut overlay after the Konami code is entered", () => {
    renderEasterEggs()
    act(() => {
      for (const key of KONAMI_KEYS) {
        dispatchKey(key)
      }
    })
    expect(screen.getByTestId("directors-cut-overlay")).toBeInTheDocument()
  })

  it("renders nothing when consumed without a provider", () => {
    render(<CinephileEasterEggs />)
    expect(screen.queryByTestId("directors-cut-overlay")).toBeNull()
  })
})
