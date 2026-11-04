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
  test("shows whole millions with no suffix", () => {
    expect(formatCOPMillionsValue(451_000_000)).toBe("$451")
  })

  test("keeps decimals instead of rounding to the nearest million", () => {
    expect(formatCOPMillionsValue(1_500_000)).toBe("$1,5")
    expect(formatCOPMillionsValue(2_850_000)).toBe("$2,85")
    expect(formatCOPMillionsValue(451_400_000)).toBe("$451,4")
  })

  test("groups thousands of millions", () => {
    expect(formatCOPMillionsValue(1_250_000_000)).toBe("$1.250")
  })
})

describe("formatCOPMillions", () => {
  test("appends the M suffix", () => {
    expect(formatCOPMillions(451_400_000)).toBe("$451,4 M")
  })
})

describe("formatCOPCompact", () => {
  test("shows the full price below 1.000 millones", () => {
    expect(formatCOPCompact(2_850_000)).toBe(formatCOP(2_850_000))
    expect(formatCOPCompact(450_500_000)).toBe(formatCOP(450_500_000))
    expect(formatCOPCompact(999_999_999)).toBe(formatCOP(999_999_999))
  })

  test("uses the millions form from 1.000 millones up", () => {
    expect(formatCOPCompact(1_000_000_000)).toBe("$1.000 M")
    expect(formatCOPCompact(1_250_500_000)).toBe("$1.250,5 M")
  })

  test("uses the full currency form below 1,000,000", () => {
    expect(formatCOPCompact(999_999)).toBe("$ 999.999")
  })
})
