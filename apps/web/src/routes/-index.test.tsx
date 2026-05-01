import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/i18n/locale-loader", () => ({
  resolveDefaultLocale: vi.fn(),
}))

const { Route, indexBeforeLoad } = await import("./index")
const { resolveDefaultLocale } = await import("@/i18n/locale-loader")

describe("routes/index", () => {
  beforeEach(() => {
    vi.mocked(resolveDefaultLocale).mockReset()
  })

  it("registers the redirect route", () => {
    expect(Route).toBeDefined()
  })

  it("throws a redirect to the resolved locale", async () => {
    vi.mocked(resolveDefaultLocale).mockResolvedValue("ko" as never)
    let thrown: unknown
    try {
      await indexBeforeLoad()
    } catch (e) {
      thrown = e
    }
    expect(resolveDefaultLocale).toHaveBeenCalled()
    expect(thrown).toBeTruthy()
  })
})
