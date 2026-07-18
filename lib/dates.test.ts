import { describe, test, expect } from "bun:test"
import { daysAgo } from "./dates"

describe("daysAgo", () => {
  test("returns a date roughly N days in the past", () => {
    const result = daysAgo(7)
    const expectedMs = Date.now() - 7 * 24 * 60 * 60 * 1000
    expect(Math.abs(result.getTime() - expectedMs)).toBeLessThan(1000)
  })

  test("returns the current time for 0 days", () => {
    const result = daysAgo(0)
    expect(Math.abs(result.getTime() - Date.now())).toBeLessThan(1000)
  })
})
