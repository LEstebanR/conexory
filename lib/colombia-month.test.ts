import { describe, test, expect } from "bun:test"
import { startOfColombiaMonth, colombiaMonthName } from "./colombia-month"

describe("startOfColombiaMonth", () => {
  test("returns midnight of the 1st in Colombia time, as a UTC instant", () => {
    expect(startOfColombiaMonth(new Date("2026-11-04T15:00:00Z")).toISOString()).toBe("2026-11-01T05:00:00.000Z")
  })

  test("still belongs to the previous month on the evening of the last day in Colombia", () => {
    // 2026-11-01T02:00Z is 9 p. m. on Oct 31 in Colombia.
    expect(startOfColombiaMonth(new Date("2026-11-01T02:00:00Z")).toISOString()).toBe("2026-10-01T05:00:00.000Z")
  })

  test("handles January", () => {
    expect(startOfColombiaMonth(new Date("2027-01-15T12:00:00Z")).toISOString()).toBe("2027-01-01T05:00:00.000Z")
  })
})

describe("colombiaMonthName", () => {
  test("names the month in Spanish, in Colombia time", () => {
    expect(colombiaMonthName(new Date("2026-11-04T15:00:00Z"))).toBe("noviembre")
    expect(colombiaMonthName(new Date("2026-11-01T02:00:00Z"))).toBe("octubre")
  })
})
