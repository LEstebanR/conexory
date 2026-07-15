import { describe, test, expect } from "bun:test"
import { cn } from "./utils"

describe("cn", () => {
  test("combines multiple class strings", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center")
  })

  test("resolves Tailwind conflicts, keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })

  test("drops falsy values", () => {
    expect(cn("flex", undefined, false, null, "gap-2")).toBe("flex gap-2")
  })

  test("returns an empty string with no arguments", () => {
    expect(cn()).toBe("")
  })
})
