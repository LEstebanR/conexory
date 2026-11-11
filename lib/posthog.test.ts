import { afterEach, describe, expect, test } from "bun:test"
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match"
import { POSTHOG_INGEST_HOST, pathWithoutQuery, posthogContext, posthogKey, posthogRewrites, trailingSlashRedirects } from "./posthog"

const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY

afterEach(() => {
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY
  else process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey
})

describe("posthogKey", () => {
  test("returns the configured key", () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test"
    expect(posthogKey()).toBe("phc_test")
  })

  test("treats a missing or empty key as absent", () => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY
    expect(posthogKey()).toBeNull()
    process.env.NEXT_PUBLIC_POSTHOG_KEY = ""
    expect(posthogKey()).toBeNull()
  })
})

describe("posthogRewrites", () => {
  test("proxies the ingest path to PostHog", () => {
    expect(posthogRewrites()).toEqual([{ source: "/ingest/:path*", destination: `${POSTHOG_INGEST_HOST}/:path*` }])
  })
})

describe("trailingSlashRedirects", () => {
  const [redirect] = trailingSlashRedirects()
  const match = getPathMatch(redirect.source, { strict: true, removeUnnamedParams: true })

  test("is permanent and drops the trailing slash", () => {
    expect(redirect.permanent).toBe(true)
    expect(match("/precios/")).toEqual({ path: "precios" })
    expect(match("/p/abc123/")).toEqual({ path: "p/abc123" })
  })

  test("leaves paths without a trailing slash and the root alone", () => {
    expect(match("/precios")).toBe(false)
    expect(match("/")).toBe(false)
  })

  test("never redirects the PostHog proxy", () => {
    expect(match("/ingest/")).toBe(false)
    expect(match("/ingest/e/")).toBe(false)
    expect(match("/ingest/i/v0/e/")).toBe(false)
  })

  test("still redirects paths that only start like the proxy", () => {
    expect(match("/ingestion/")).toEqual({ path: "ingestion" })
  })
})

describe("pathWithoutQuery", () => {
  test("drops the query string and fragment, which can carry secrets", () => {
    expect(pathWithoutQuery("/reset-password?token=abc123")).toBe("/reset-password")
    expect(pathWithoutQuery("/p/slug#fotos")).toBe("/p/slug")
    expect(pathWithoutQuery("/precios")).toBe("/precios")
  })
})

describe("posthogContext", () => {
  const names = ["VERCEL_ENV", "VERCEL_GIT_COMMIT_SHA", "NEXT_PUBLIC_VERCEL_ENV", "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA"]
  const original = Object.fromEntries(names.map((name) => [name, process.env[name]]))

  afterEach(() => {
    for (const name of names) {
      if (original[name] === undefined) delete process.env[name]
      else process.env[name] = original[name]
    }
  })

  test("uses Vercel's environment and the short commit SHA", () => {
    for (const name of names) delete process.env[name]
    process.env.VERCEL_ENV = "production"
    process.env.VERCEL_GIT_COMMIT_SHA = "0869586abcdef"
    expect(posthogContext()).toEqual({ environment: "production", release: "0869586" })
  })

  test("prefers the values inlined into the browser bundle", () => {
    for (const name of names) delete process.env[name]
    process.env.NEXT_PUBLIC_VERCEL_ENV = "preview"
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA = "1234567890"
    expect(posthogContext()).toEqual({ environment: "preview", release: "1234567" })
  })

  test("falls back to development with no release outside Vercel, treating empty values as absent", () => {
    for (const name of names) delete process.env[name]
    process.env.NEXT_PUBLIC_VERCEL_ENV = ""
    expect(posthogContext()).toEqual({ environment: "development", release: null })
  })
})
