import { describe, test, expect } from "bun:test"
import { readMetrics, socialTotal, contactTotal } from "./property-metrics"

describe("readMetrics", () => {
  test("returns all-zero metrics for null/undefined/non-object input", () => {
    const empty = {
      whatsapp: 0,
      social: { instagram: 0, facebook: 0, tiktok: 0, linkedin: 0, youtube: 0 },
      contact: { phone: 0, email: 0, whatsapp: 0 },
    }
    expect(readMetrics(null)).toEqual(empty)
    expect(readMetrics(undefined)).toEqual(empty)
    expect(readMetrics("nope")).toEqual(empty)
    expect(readMetrics([1, 2])).toEqual(empty)
  })

  test("reads real numeric values", () => {
    const metrics = readMetrics({
      whatsapp: 5,
      social: { instagram: 2, facebook: 1 },
      contact: { phone: 3 },
    })
    expect(metrics.whatsapp).toBe(5)
    expect(metrics.social.instagram).toBe(2)
    expect(metrics.social.facebook).toBe(1)
    expect(metrics.social.tiktok).toBe(0)
    expect(metrics.contact.phone).toBe(3)
    expect(metrics.contact.email).toBe(0)
  })

  test("treats non-numeric values as 0", () => {
    const metrics = readMetrics({ whatsapp: "5", social: "not an object" })
    expect(metrics.whatsapp).toBe(0)
    expect(metrics.social.instagram).toBe(0)
  })
})

describe("socialTotal / contactTotal", () => {
  test("sum every channel", () => {
    const metrics = readMetrics({
      social: { instagram: 1, facebook: 2, tiktok: 3, linkedin: 4, youtube: 5 },
      contact: { phone: 1, email: 2, whatsapp: 3 },
    })
    expect(socialTotal(metrics)).toBe(15)
    expect(contactTotal(metrics)).toBe(6)
  })
})
