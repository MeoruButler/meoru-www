import { describe, it, expect, beforeEach, afterEach } from "vitest"
import {
  loadTwitterWidgets,
  resetTwitterWidgetsForTesting,
  TWITTER_WIDGETS_SCRIPT_ID,
  TWITTER_WIDGETS_SRC,
  type TwitterWidgets,
} from "../twitter/widgets-loader"

function fireScriptEvent(type: "load" | "error", twttr?: TwitterWidgets): void {
  const script = document.getElementById(
    TWITTER_WIDGETS_SCRIPT_ID
  ) as HTMLScriptElement | null
  if (!script) throw new Error("script element missing")
  if (twttr) window.twttr = twttr
  script.dispatchEvent(new Event(type))
}

describe("widgets-loader", () => {
  beforeEach(() => {
    resetTwitterWidgetsForTesting()
  })

  afterEach(() => {
    resetTwitterWidgetsForTesting()
  })

  it("appends the widgets.js script exactly once for concurrent calls", async () => {
    const first = loadTwitterWidgets()
    const second = loadTwitterWidgets()
    expect(first).toBe(second)
    const scripts = Array.from(
      document.querySelectorAll(`#${TWITTER_WIDGETS_SCRIPT_ID}`)
    )
    expect(scripts).toHaveLength(1)
    expect((scripts[0] as HTMLScriptElement).src).toContain(TWITTER_WIDGETS_SRC)

    const fakeTwttr: TwitterWidgets = { widgets: { load: () => {} } }
    fireScriptEvent("load", fakeTwttr)
    await expect(first).resolves.toBe(fakeTwttr)
  })

  it("resolves immediately when window.twttr is already present", async () => {
    const fakeTwttr: TwitterWidgets = { widgets: { load: () => {} } }
    window.twttr = fakeTwttr
    await expect(loadTwitterWidgets()).resolves.toBe(fakeTwttr)
    expect(document.getElementById(TWITTER_WIDGETS_SCRIPT_ID)).toBeNull()
  })

  it("rejects when the script loads without populating window.twttr", async () => {
    const promise = loadTwitterWidgets()
    fireScriptEvent("load")
    await expect(promise).rejects.toThrow(/twttr is not available/)
  })

  it("reuses an existing widgets.js script element if one is already in the DOM", async () => {
    const existing = document.createElement("script")
    existing.id = TWITTER_WIDGETS_SCRIPT_ID
    document.head.appendChild(existing)

    const promise = loadTwitterWidgets()
    expect(
      document.querySelectorAll(`#${TWITTER_WIDGETS_SCRIPT_ID}`)
    ).toHaveLength(1)
    expect(existing.src).toBe("")

    const fakeTwttr: TwitterWidgets = { widgets: { load: () => {} } }
    fireScriptEvent("load", fakeTwttr)
    await expect(promise).resolves.toBe(fakeTwttr)
  })

  it("rejects and clears the cache when the script errors", async () => {
    const failing = loadTwitterWidgets()
    fireScriptEvent("error")
    await expect(failing).rejects.toThrow(/Failed to load/)

    const fakeTwttr: TwitterWidgets = { widgets: { load: () => {} } }
    window.twttr = fakeTwttr
    await expect(loadTwitterWidgets()).resolves.toBe(fakeTwttr)
  })
})
