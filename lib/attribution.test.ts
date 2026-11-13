import { describe, expect, test } from "bun:test"
import { attributedHref, parseSignupSource, signupSourceFromCookies, signupSourceToRemember } from "./attribution"

describe("parseSignupSource", () => {
  test("accepts known sources", () => {
    expect(parseSignupSource("property_page")).toBe("property_page")
    expect(parseSignupSource("agent_profile")).toBe("agent_profile")
  })

  test("rejects unknown, empty or missing values", () => {
    expect(parseSignupSource("facebook")).toBeNull()
    expect(parseSignupSource("")).toBeNull()
    expect(parseSignupSource(null)).toBeNull()
    expect(parseSignupSource(undefined)).toBeNull()
  })
})

describe("attributedHref", () => {
  test("adds the source and medium to the path", () => {
    expect(attributedHref("/", "property_page")).toBe("/?utm_source=property_page&utm_medium=footer")
  })
})

describe("signupSourceFromCookies", () => {
  const ctxWith = (cookies: Record<string, string>) => ({ getCookie: (name: string) => cookies[name] ?? null })

  test("reads a remembered source", () => {
    expect(signupSourceFromCookies(ctxWith({ signup_source: "property_page" }))).toBe("property_page")
  })

  test("returns null without context, cookie or with a tampered value", () => {
    expect(signupSourceFromCookies(null)).toBeNull()
    expect(signupSourceFromCookies(ctxWith({}))).toBeNull()
    expect(signupSourceFromCookies(ctxWith({ signup_source: "admin" }))).toBeNull()
  })
})

describe("signupSourceToRemember", () => {
  test("remembers a valid source on first touch", () => {
    expect(signupSourceToRemember(new URLSearchParams("utm_source=agent_profile"), false)).toBe("agent_profile")
  })

  test("keeps the first source already remembered", () => {
    expect(signupSourceToRemember(new URLSearchParams("utm_source=agent_profile"), true)).toBeNull()
  })

  test("ignores invalid or missing sources", () => {
    expect(signupSourceToRemember(new URLSearchParams("utm_source=spam"), false)).toBeNull()
    expect(signupSourceToRemember(new URLSearchParams(""), false)).toBeNull()
  })
})
