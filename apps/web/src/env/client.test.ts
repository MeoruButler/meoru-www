import { describe, it, expect } from "vitest"
import { clientEnv } from "./client"

describe("env/client", () => {
  it("exposes a validated client env object", () => {
    expect(clientEnv).toBeTypeOf("object")
  })
})
