import { describe, test, expect } from "bun:test"
import { parseOnboarding, DEFAULT_ONBOARDING } from "./onboarding"

describe("parseOnboarding", () => {
  test("returns all-false defaults for null/undefined", () => {
    expect(parseOnboarding(null)).toEqual(DEFAULT_ONBOARDING)
    expect(parseOnboarding(undefined)).toEqual(DEFAULT_ONBOARDING)
  })

  test("returns defaults for non-object input", () => {
    expect(parseOnboarding("not an object")).toEqual(DEFAULT_ONBOARDING)
    expect(parseOnboarding(42)).toEqual(DEFAULT_ONBOARDING)
  })

  test("returns defaults for an array (typeof array is 'object')", () => {
    expect(parseOnboarding([1, 2, 3])).toEqual(DEFAULT_ONBOARDING)
  })

  test("merges known boolean flags over the defaults", () => {
    expect(parseOnboarding({ welcomeModalSeen: true, propertyTourCompleted: true })).toEqual({
      ...DEFAULT_ONBOARDING,
      welcomeModalSeen: true,
      propertyTourCompleted: true,
    })
  })

  test("ignores unknown keys", () => {
    expect(parseOnboarding({ notARealFlag: true })).toEqual(DEFAULT_ONBOARDING)
  })

  test("ignores non-boolean values for known keys", () => {
    expect(parseOnboarding({ welcomeModalSeen: "true" })).toEqual(DEFAULT_ONBOARDING)
    expect(parseOnboarding({ welcomeModalSeen: 1 })).toEqual(DEFAULT_ONBOARDING)
  })
})
