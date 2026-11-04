import { describe, test, expect } from "bun:test"
import { daysAgo, formatColombiaDate, colombiaHour } from "./dates"

// 2026-10-30T01:49Z is 8:49 p. m. on Oct 29 in Colombia (UTC-5).
const lateEveningInColombia = new Date("2026-10-30T01:49:00Z")

describe("formatColombiaDate", () => {
  test("shows the Colombian day, not the UTC one", () => {
    expect(formatColombiaDate(lateEveningInColombia, { day: "numeric", month: "long" })).toBe("29 de octubre")
  })

  test("shows the Colombian time", () => {
    const text = formatColombiaDate(lateEveningInColombia, { hour: "2-digit", minute: "2-digit" })
    expect(text).toContain("08:49")
    expect(text).toMatch(/p\.\s?m\./)
  })

  test("accepts an ISO string", () => {
    expect(formatColombiaDate("2026-10-30T01:49:00Z", { day: "numeric" })).toBe("29")
  })
})

describe("colombiaHour", () => {
  test("returns the hour in Colombia time", () => {
    expect(colombiaHour(lateEveningInColombia)).toBe(20)
    expect(colombiaHour(new Date("2026-10-30T05:00:00Z"))).toBe(0)
  })
})

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
