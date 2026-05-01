import { describe, it, expect } from "vitest"
import { messages } from "../messages"

function leafKeys(input: object, prefix = ""): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(input)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === "object") {
      keys.push(...leafKeys(value, path))
    } else {
      keys.push(path)
    }
  }
  return keys.sort()
}

describe("i18n/messages", () => {
  it("provides dictionaries for every supported locale", () => {
    expect(messages.en).toBeDefined()
    expect(messages.ko).toBeDefined()
  })

  it("keeps the same shape across locales", () => {
    expect(leafKeys(messages.ko)).toEqual(leafKeys(messages.en))
  })

  it("renders non-empty strings for every leaf", () => {
    for (const dict of Object.values(messages)) {
      for (const key of leafKeys(dict)) {
        const segments = key.split(".")
        let cursor: unknown = dict
        for (const seg of segments) {
          cursor = (cursor as Record<string, unknown>)[seg]
        }
        expect(typeof cursor).toBe("string")
        expect((cursor as string).length).toBeGreaterThan(0)
      }
    }
  })
})
