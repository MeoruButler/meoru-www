import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import {
  logCinephileQuote,
  useDirectorsCut,
  useKonamiCode,
} from "../easter-eggs"

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

describe("logCinephileQuote", () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
  })
  afterEach(() => {
    logSpy.mockRestore()
  })

  it("writes a styled cinephile quote to the console", () => {
    logCinephileQuote()
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0]?.[0]).toContain("Meoru Butler")
  })
})

describe("useKonamiCode", () => {
  it("invokes the callback only after the full sequence", () => {
    const onTrigger = vi.fn()
    renderHook(() => useKonamiCode(onTrigger))

    for (const key of KONAMI_KEYS.slice(0, -1)) {
      act(() => dispatchKey(key))
    }
    expect(onTrigger).not.toHaveBeenCalled()

    act(() => dispatchKey(KONAMI_KEYS[KONAMI_KEYS.length - 1]))
    expect(onTrigger).toHaveBeenCalledTimes(1)
  })

  it("ignores partial sequences with the wrong final key", () => {
    const onTrigger = vi.fn()
    renderHook(() => useKonamiCode(onTrigger))
    for (const key of KONAMI_KEYS.slice(0, -1)) {
      act(() => dispatchKey(key))
    }
    act(() => dispatchKey("z"))
    expect(onTrigger).not.toHaveBeenCalled()
  })
})

describe("useDirectorsCut", () => {
  it("toggles the active flag every time the Konami code is entered", () => {
    const { result } = renderHook(() => useDirectorsCut())
    expect(result.current).toBe(false)

    act(() => {
      for (const key of KONAMI_KEYS) {
        dispatchKey(key)
      }
    })
    expect(result.current).toBe(true)

    act(() => {
      for (const key of KONAMI_KEYS) {
        dispatchKey(key)
      }
    })
    expect(result.current).toBe(false)
  })
})
