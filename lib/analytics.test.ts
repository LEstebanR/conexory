import { afterAll, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"

const mockCaptureImmediate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve()
})

class FakePostHog {
  captureImmediate = mockCaptureImmediate
}

mock.module("posthog-node", () => ({ PostHog: FakePostHog }))

const { trackEvent, trackAnonymousEvent, trackSignupCompleted } = await import("./analytics")
const { resetPostHogServerForTests } = await import("./posthog-server")

const VERCEL_VARS = ["VERCEL_ENV", "VERCEL_GIT_COMMIT_SHA", "NEXT_PUBLIC_VERCEL_ENV", "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA"]
const originalVercel = Object.fromEntries(VERCEL_VARS.map((name) => [name, process.env[name]]))
const context = { environment: "preview", release: "abc1234" }

const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const mockConsoleError = spyOn(console, "error").mockImplementation(() => {})

beforeEach(() => {
  process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test"
  for (const name of VERCEL_VARS) delete process.env[name]
  process.env.VERCEL_ENV = "preview"
  process.env.VERCEL_GIT_COMMIT_SHA = "abc1234def5678"
  resetPostHogServerForTests()
  mockCaptureImmediate.mockClear()
  mockCaptureImmediate.mockImplementation(() => Promise.resolve())
  mockConsoleError.mockClear()
})

afterAll(() => {
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY
  else process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey
  for (const name of VERCEL_VARS) {
    if (originalVercel[name] === undefined) delete process.env[name]
    else process.env[name] = originalVercel[name]
  }
  resetPostHogServerForTests()
  mockConsoleError.mockRestore()
})

describe("trackEvent", () => {
  test("sends the event under the user id", async () => {
    await trackEvent("u1", "upgrade_completed", { source: "card" })

    expect(mockCaptureImmediate).toHaveBeenCalledWith({
      distinctId: "u1",
      event: "upgrade_completed",
      properties: { ...context, source: "card" },
    })
  })

  test("sends only the deploy context for events without properties of their own", async () => {
    await trackEvent("u1", "first_property_created")

    expect(mockCaptureImmediate).toHaveBeenCalledWith({
      distinctId: "u1",
      event: "first_property_created",
      properties: context,
    })
  })

  test("does nothing without a PostHog key", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = ""

    await trackEvent("u1", "first_property_shared")

    expect(mockCaptureImmediate).not.toHaveBeenCalled()
  })

  test("never throws when sending fails", async () => {
    mockCaptureImmediate.mockImplementation(() => Promise.reject(new Error("network down")))

    await expect(trackEvent("u1", "upgrade_page_viewed")).resolves.toBeUndefined()
    expect(mockConsoleError).toHaveBeenCalledWith("[posthog] could not track upgrade_page_viewed:", expect.any(Error))
  })
})

describe("trackAnonymousEvent", () => {
  test("uses a fresh id per event and skips the person profile", async () => {
    await trackAnonymousEvent("signup_started")
    await trackAnonymousEvent("signup_started")

    const [first, second] = mockCaptureImmediate.mock.calls.map(([message]) => message as {
      distinctId: string
      event: string
      properties: Record<string, unknown>
    })
    expect(first.event).toBe("signup_started")
    expect(first.properties).toEqual({ ...context, $process_person_profile: false })
    expect(first.distinctId).toMatch(/^[0-9a-f-]{36}$/)
    expect(second.distinctId).not.toBe(first.distinctId)
  })
})

describe("trackSignupCompleted", () => {
  test("labels a verified sign-up as Google", async () => {
    await trackSignupCompleted({ id: "u1", emailVerified: true })

    expect(mockCaptureImmediate).toHaveBeenCalledWith({
      distinctId: "u1",
      event: "signup_completed",
      properties: { ...context, method: "google" },
    })
  })

  test("labels an unverified sign-up as email", async () => {
    await trackSignupCompleted({ id: "u2", emailVerified: false })

    expect(mockCaptureImmediate).toHaveBeenCalledWith({
      distinctId: "u2",
      event: "signup_completed",
      properties: { ...context, method: "email" },
    })
  })
})
