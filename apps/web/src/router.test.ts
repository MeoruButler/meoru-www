import { describe, it, expect } from "vitest"
import { getRouter } from "./router"

describe("getRouter", () => {
  it("creates a TanStack router with configured options", () => {
    const router = getRouter()
    expect(router.options.scrollRestoration).toBe(true)
    expect(router.options.defaultPreload).toBe("intent")
    expect(router.options.defaultPreloadStaleTime).toBe(0)
    expect(router.options.routeTree).toBeDefined()
  })
})
