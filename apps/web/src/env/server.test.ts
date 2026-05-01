// @vitest-environment node
import { describe, it, expect } from "vitest"
import { serverEnv } from "./server"

describe("env/server", () => {
  it("exposes a validated server env with NODE_ENV", () => {
    expect(serverEnv.NODE_ENV).toMatch(/^(development|test|production)$/)
  })
})
