import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { getAppUrl } from "./urls"

const ENV_KEYS = ["APP_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"] as const
const originalEnv: Record<string, string | undefined> = {}

beforeEach(() => {
  for (const key of ENV_KEYS) {
    originalEnv[key] = process.env[key]
    delete process.env[key]
  }
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key]
    else process.env[key] = originalEnv[key]
  }
})

describe("getAppUrl", () => {
  test("falls back to localhost when nothing is set", () => {
    expect(getAppUrl()).toBe("http://localhost:3000")
  })

  test("prefers VERCEL_URL over the localhost fallback", () => {
    process.env.VERCEL_URL = "conexory-preview.vercel.app"
    expect(getAppUrl()).toBe("https://conexory-preview.vercel.app")
  })

  test("prefers VERCEL_PROJECT_PRODUCTION_URL over VERCEL_URL", () => {
    process.env.VERCEL_URL = "conexory-preview.vercel.app"
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "conexory.com"
    expect(getAppUrl()).toBe("https://conexory.com")
  })

  test("prefers APP_URL over everything else", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "conexory.com"
    process.env.APP_URL = "https://custom-domain.com"
    expect(getAppUrl()).toBe("https://custom-domain.com")
  })

  test("treats an empty string as absent", () => {
    process.env.APP_URL = ""
    process.env.VERCEL_PROJECT_PRODUCTION_URL = ""
    process.env.VERCEL_URL = "conexory-preview.vercel.app"
    expect(getAppUrl()).toBe("https://conexory-preview.vercel.app")
  })
})
