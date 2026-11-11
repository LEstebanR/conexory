import { afterAll, beforeEach, describe, expect, mock, spyOn, test } from "bun:test"

const mockCaptureExceptionImmediate = mock((...args: [unknown, unknown, unknown]) => {
  void args
  return Promise.resolve()
})
const constructorCalls: unknown[][] = []

class FakePostHog {
  constructor(...args: unknown[]) {
    constructorCalls.push(args)
  }
  captureExceptionImmediate = mockCaptureExceptionImmediate
}

mock.module("posthog-node", () => ({ PostHog: FakePostHog }))

const { reportError, captureServerError, resetReportErrorClientForTests } = await import("./report-error")

const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const VERCEL_VARS = ["VERCEL_ENV", "VERCEL_GIT_COMMIT_SHA", "NEXT_PUBLIC_VERCEL_ENV", "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA"]
const originalVercel = Object.fromEntries(VERCEL_VARS.map((name) => [name, process.env[name]]))
const context = { environment: "preview", release: "abc1234" }
const mockConsoleError = spyOn(console, "error").mockImplementation(() => {})

beforeEach(() => {
  process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test"
  for (const name of VERCEL_VARS) delete process.env[name]
  process.env.VERCEL_ENV = "preview"
  process.env.VERCEL_GIT_COMMIT_SHA = "abc1234def5678"
  resetReportErrorClientForTests()
  constructorCalls.length = 0
  mockCaptureExceptionImmediate.mockClear()
  mockCaptureExceptionImmediate.mockImplementation(() => Promise.resolve())
  mockConsoleError.mockClear()
})

afterAll(() => {
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY
  else process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey
  for (const name of VERCEL_VARS) {
    if (originalVercel[name] === undefined) delete process.env[name]
    else process.env[name] = originalVercel[name]
  }
  resetReportErrorClientForTests()
  mockConsoleError.mockRestore()
})

describe("reportError", () => {
  test("logs and sends the original error with its context", async () => {
    const error = new Error("boom")
    await reportError("createProperty failed", error, { userId: "u1" })

    expect(mockConsoleError).toHaveBeenCalledWith("createProperty failed", error, { userId: "u1" })
    expect(mockCaptureExceptionImmediate).toHaveBeenCalledWith(error, undefined, {
      ...context,
      message: "createProperty failed",
      userId: "u1",
    })
  })

  test("builds an Error from the message when there is no error object", async () => {
    await reportError("Orphan reconciliation skipped", undefined, { error: "http_500" })

    expect(mockConsoleError).toHaveBeenCalledWith("Orphan reconciliation skipped", { error: "http_500" })
    const [sent, , properties] = mockCaptureExceptionImmediate.mock.calls[0]
    expect(sent).toBeInstanceOf(Error)
    expect((sent as Error).message).toBe("Orphan reconciliation skipped")
    expect(properties).toEqual({ ...context, message: "Orphan reconciliation skipped", error: "http_500" })
  })

  test("keeps a non-Error value as a detail property", async () => {
    await reportError("weird failure", "plain string")

    const [sent, , properties] = mockCaptureExceptionImmediate.mock.calls[0]
    expect((sent as Error).message).toBe("weird failure")
    expect(properties).toEqual({ ...context, message: "weird failure", detail: "plain string" })
  })

  test("only logs when there is no PostHog key", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = ""
    await reportError("createProperty failed", new Error("boom"))

    expect(mockConsoleError).toHaveBeenCalledTimes(1)
    expect(constructorCalls).toHaveLength(0)
    expect(mockCaptureExceptionImmediate).not.toHaveBeenCalled()
  })
})

describe("captureServerError", () => {
  test("creates a single unbatched client pointed at PostHog", async () => {
    await captureServerError(new Error("a"))
    await captureServerError(new Error("b"))

    expect(constructorCalls).toEqual([["phc_test", { host: "https://us.i.posthog.com", flushAt: 1, flushInterval: 0 }]])
    expect(mockCaptureExceptionImmediate).toHaveBeenCalledTimes(2)
  })

  test("never throws when sending fails", async () => {
    mockCaptureExceptionImmediate.mockImplementation(() => Promise.reject(new Error("network down")))

    await expect(captureServerError(new Error("boom"))).resolves.toBeUndefined()
    expect(mockConsoleError).toHaveBeenCalledWith("[posthog] could not report error:", expect.any(Error))
  })
})
