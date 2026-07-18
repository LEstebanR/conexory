import { describe, test, expect } from "bun:test"
import {
  propertyLimit,
  photoLimit,
  pinnedLimit,
  aiMessageLimit,
  hasProAccess,
  FREE_PROPERTY_LIMIT,
  PRO_PROPERTY_LIMIT,
  FREE_PHOTO_LIMIT,
  PRO_PHOTO_LIMIT,
  PINNED_LIMIT,
  FREE_AI_MESSAGE_LIMIT,
  PRO_AI_MESSAGE_LIMIT,
} from "./plans"

describe("propertyLimit", () => {
  test("returns the free limit for non-premium users", () => {
    expect(propertyLimit(false)).toBe(FREE_PROPERTY_LIMIT)
  })

  test("returns the pro limit for premium users", () => {
    expect(propertyLimit(true)).toBe(PRO_PROPERTY_LIMIT)
  })
})

describe("photoLimit", () => {
  test("returns the free limit for non-premium users", () => {
    expect(photoLimit(false)).toBe(FREE_PHOTO_LIMIT)
  })

  test("returns the pro limit for premium users", () => {
    expect(photoLimit(true)).toBe(PRO_PHOTO_LIMIT)
  })
})

describe("pinnedLimit", () => {
  test("is the same regardless of plan", () => {
    expect(pinnedLimit()).toBe(PINNED_LIMIT)
  })
})

describe("aiMessageLimit", () => {
  test("returns the free limit (0) for non-premium users", () => {
    expect(aiMessageLimit(false)).toBe(FREE_AI_MESSAGE_LIMIT)
  })

  test("returns the pro limit for premium users", () => {
    expect(aiMessageLimit(true)).toBe(PRO_AI_MESSAGE_LIMIT)
  })
})

describe("hasProAccess", () => {
  test("is true for a premium, non-admin user", () => {
    expect(hasProAccess({ isPremium: true, role: "user" })).toBe(true)
  })

  test("is false for a non-premium, non-admin user", () => {
    expect(hasProAccess({ isPremium: false, role: "user" })).toBe(false)
  })

  test("is true for an admin regardless of isPremium", () => {
    expect(hasProAccess({ isPremium: false, role: "admin" })).toBe(true)
  })
})
