import { afterEach, describe, expect, test } from "bun:test"
import { POSTHOG_INGEST_HOST, posthogKey, posthogRewrites } from "./posthog"

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
