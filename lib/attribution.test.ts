import { describe, expect, mock, test } from "bun:test"
import {
  attributedHref,
  forgetSignupSource,
  parseSignupSource,
  signupSourceFromCookies,
  signupSourceToRemember,
} from "./attribution"

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

describe("forgetSignupSource", () => {
  test("clears a cookie that holds a source", () => {
    const setCookie = mock(() => {})
    forgetSignupSource({ getCookie: () => "agent_profile", setCookie })
    expect(setCookie).toHaveBeenCalledWith("signup_source", "", { maxAge: 0, path: "/" })
  })

  test("leaves the response alone when there is nothing to clear", () => {
    const setCookie = mock(() => {})
    forgetSignupSource({ getCookie: () => null, setCookie })
    forgetSignupSource(null)
    expect(setCookie).not.toHaveBeenCalled()
  })
})

describe("signupSourceToRemember", () => {
  test("remembers a valid source on first touch", () => {
    expect(signupSourceToRemember(new URLSearchParams("utm_source=agent_profile"), undefined)).toBe("agent_profile")
  })

  test("keeps a valid source already remembered", () => {
    expect(signupSourceToRemember(new URLSearchParams("utm_source=agent_profile"), "property_page")).toBeNull()
  })

  test("replaces an invalid remembered value", () => {
    expect(signupSourceToRemember(new URLSearchParams("utm_source=agent_profile"), "admin")).toBe("agent_profile")
  })

  test("ignores invalid or missing sources", () => {
    expect(signupSourceToRemember(new URLSearchParams("utm_source=spam"), undefined)).toBeNull()
    expect(signupSourceToRemember(new URLSearchParams(""), undefined)).toBeNull()
  })
})
