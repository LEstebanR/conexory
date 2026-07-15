import { describe, test, expect } from "bun:test"
import {
  propertyLimit,
  photoLimit,
  FREE_PROPERTY_LIMIT,
  PRO_PROPERTY_LIMIT,
  FREE_PHOTO_LIMIT,
  PRO_PHOTO_LIMIT,
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
