import { describe, test, expect } from "bun:test"
import { toWhatsAppNumber, sanitizePhoneInput } from "./phone"

describe("toWhatsAppNumber", () => {
  test("prepends the Colombia country code to a bare local number", () => {
    expect(toWhatsAppNumber("3001234567")).toBe("573001234567")
  })

  test("strips formatting characters before prepending", () => {
    expect(toWhatsAppNumber("(300) 123-4567")).toBe("573001234567")
  })

  test("does not double-prefix a number that already starts with 57", () => {
    expect(toWhatsAppNumber("573001234567")).toBe("573001234567")
  })
})

describe("sanitizePhoneInput", () => {
  test("strips non-digit characters", () => {
    expect(sanitizePhoneInput("(300) 123-4567")).toBe("3001234567")
  })

  test("drops an accidentally-typed +57 country code", () => {
    expect(sanitizePhoneInput("+573001234567")).toBe("3001234567")
  })

  test("drops a country code typed without the +", () => {
    expect(sanitizePhoneInput("573001234567")).toBe("3001234567")
  })

  test("caps the result at 10 digits", () => {
    expect(sanitizePhoneInput("30012345678901")).toBe("3001234567")
  })

  test("leaves a plain 10-digit local number untouched", () => {
    expect(sanitizePhoneInput("3001234567")).toBe("3001234567")
  })
})
