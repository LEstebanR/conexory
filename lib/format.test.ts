import { describe, test, expect } from "bun:test"
import { formatCOP, formatCOPMillionsValue, formatCOPMillions, formatCOPCompact } from "./format"

describe("formatCOP", () => {
  test("formats a whole number as Colombian pesos, no decimals", () => {
    expect(formatCOP(1500000)).toBe("$ 1.500.000")
  })

  test("formats zero", () => {
    expect(formatCOP(0)).toBe("$ 0")
  })
})

describe("formatCOPMillionsValue", () => {
  test("rounds to the nearest million with no suffix", () => {
    expect(formatCOPMillionsValue(451_400_000)).toBe("$451")
  })

  test("rounds up at the midpoint", () => {
    expect(formatCOPMillionsValue(1_500_000)).toBe("$2")
  })
})

describe("formatCOPMillions", () => {
  test("appends the M suffix", () => {
    expect(formatCOPMillions(451_400_000)).toBe("$451 M")
  })
})

describe("formatCOPCompact", () => {
  test("uses the millions form at or above 1,000,000", () => {
    expect(formatCOPCompact(1_500_000)).toBe("$2 M")
  })

  test("uses the full currency form below 1,000,000", () => {
    expect(formatCOPCompact(999_999)).toBe("$ 999.999")
  })
})
