import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { LocaleProvider } from "@/i18n/locale-provider"
import { ThemeProvider } from "@/theme/theme-provider"
import { TweetEmbed } from "../twitter/tweet-embed"

const widgetsLoad = vi.fn()
const loadTwitterWidgets = vi.fn()

vi.mock("../twitter/widgets-loader", () => ({
  loadTwitterWidgets: (...args: unknown[]) => loadTwitterWidgets(...args),
}))

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

function setupMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      media: "(prefers-color-scheme: dark)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: () => true,
    }),
  )
}

function renderEmbed(props: { tweetId?: string; username?: string } = {}) {
  return render(
    <ThemeProvider>
      <LocaleProvider locale="en">
        <TweetEmbed
          tweetId={props.tweetId ?? "12345"}
          username={props.username ?? "Meoru_butler"}
        />
      </LocaleProvider>
    </ThemeProvider>,
  )
}

describe("TweetEmbed", () => {
  beforeEach(() => {
    setupCookie()
    setupMatchMedia(false)
    widgetsLoad.mockReset()
    loadTwitterWidgets.mockReset()
    loadTwitterWidgets.mockResolvedValue({ widgets: { load: widgetsLoad } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renders a blockquote with the tweet URL and current locale/theme", async () => {
    renderEmbed({ tweetId: "9001", username: "Meoru_butler" })
    const container = screen.getByTestId("tweet-embed")
    const blockquote = container.querySelector("blockquote.twitter-tweet")
    expect(blockquote).not.toBeNull()
    expect(blockquote?.getAttribute("data-lang")).toBe("en")
    expect(blockquote?.getAttribute("data-theme")).toBe("light")
    expect(
      blockquote?.querySelector("a")?.getAttribute("href"),
    ).toBe("https://twitter.com/Meoru_butler/status/9001")
    await waitFor(() => expect(widgetsLoad).toHaveBeenCalledTimes(1))
    expect(widgetsLoad).toHaveBeenCalledWith(container)
  })

  it("re-runs widgets.load when the locale changes", async () => {
    const { rerender } = render(
      <ThemeProvider>
        <LocaleProvider locale="en">
          <TweetEmbed tweetId="9001" username="Meoru_butler" />
        </LocaleProvider>
      </ThemeProvider>,
    )
    await waitFor(() => expect(widgetsLoad).toHaveBeenCalledTimes(1))

    rerender(
      <ThemeProvider>
        <LocaleProvider locale="ko">
          <TweetEmbed tweetId="9001" username="Meoru_butler" />
        </LocaleProvider>
      </ThemeProvider>,
    )
    await waitFor(() => expect(widgetsLoad).toHaveBeenCalledTimes(2))
    const blockquote = screen
      .getByTestId("tweet-embed")
      .querySelector("blockquote.twitter-tweet")
    expect(blockquote?.getAttribute("data-lang")).toBe("ko")
  })

  it("clears the container on unmount so React does not reconcile stale DOM", () => {
    const { unmount } = renderEmbed()
    const container = screen.getByTestId("tweet-embed")
    expect(container.innerHTML).toContain("twitter-tweet")
    unmount()
    expect(container.innerHTML).toBe("")
  })

  it("ignores a failed widgets.js fetch and keeps the blockquote fallback", async () => {
    loadTwitterWidgets.mockRejectedValueOnce(new Error("network down"))
    renderEmbed({ tweetId: "555" })
    const blockquote = screen
      .getByTestId("tweet-embed")
      .querySelector("blockquote.twitter-tweet")
    expect(blockquote).not.toBeNull()
    await waitFor(() => expect(loadTwitterWidgets).toHaveBeenCalled())
    expect(widgetsLoad).not.toHaveBeenCalled()
  })
})
