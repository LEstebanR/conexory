import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

const mockInit = mock((...args: [string, Record<string, unknown>]) => void args)
const mockCaptureException = mock((...args: [unknown, unknown]) => void args)

mock.module("posthog-js", () => ({
  default: { init: mockInit, captureException: mockCaptureException },
}))

const { loadPostHog, captureClientError, captureUncaughtErrors, resetPostHogClientForTests } = await import(
  "./posthog-client"
)

type Listener = (event: Record<string, unknown>) => void

const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
const hadWindow = "window" in globalThis
let listeners: Record<string, Listener> = {}

function setWindow(value: object | undefined) {
  if (value === undefined) delete (globalThis as { window?: unknown }).window
  else (globalThis as { window?: unknown }).window = value
}

function fakeWindow() {
  return {
    addEventListener: (type: string, listener: Listener) => {
      listeners[type] = listener
    },
  }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

beforeEach(() => {
  process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test"
  listeners = {}
  setWindow(fakeWindow())
  resetPostHogClientForTests()
  mockInit.mockClear()
  mockInit.mockImplementation(() => {})
  mockCaptureException.mockClear()
})

afterAll(() => {
  if (originalKey === undefined) delete process.env.NEXT_PUBLIC_POSTHOG_KEY
  else process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey
  if (!hadWindow) setWindow(undefined)
  resetPostHogClientForTests()
})

describe("loadPostHog", () => {
  test("initializes once, through the proxy, with every background request turned off", async () => {
    const [first, second] = await Promise.all([loadPostHog(), loadPostHog()])

    expect(first).toBe(second)
    expect(mockInit).toHaveBeenCalledTimes(1)
    const [key, config] = mockInit.mock.calls[0]
    expect(key).toBe("phc_test")
    expect(config).toMatchObject({
      api_host: "/ingest",
      advanced_disable_flags: true,
      disable_external_dependency_loading: true,
      capture_exceptions: false,
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
    })
  })

  test("is a no-op without a key", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = ""
    expect(await loadPostHog()).toBeNull()
    expect(mockInit).not.toHaveBeenCalled()
  })

  test("is a no-op on the server", async () => {
    setWindow(undefined)
    expect(await loadPostHog()).toBeNull()
    expect(mockInit).not.toHaveBeenCalled()
  })

  test("resolves to null when the SDK fails to initialize", async () => {
    mockInit.mockImplementation(() => {
      throw new Error("blocked")
    })
    expect(await loadPostHog()).toBeNull()
  })
})

describe("captureClientError", () => {
  test("loads the SDK on demand and sends the error", async () => {
    const error = new Error("render failed")
    await captureClientError(error, { boundary: "dashboard" })

    expect(mockInit).toHaveBeenCalledTimes(1)
    expect(mockCaptureException).toHaveBeenCalledWith(error, { boundary: "dashboard" })
  })

  test("does nothing without a key", async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = ""
    await captureClientError(new Error("render failed"))
    expect(mockCaptureException).not.toHaveBeenCalled()
  })
})

describe("captureUncaughtErrors", () => {
  test("loads nothing until an error happens", () => {
    captureUncaughtErrors()
    expect(Object.keys(listeners).sort()).toEqual(["error", "unhandledrejection"])
    expect(mockInit).not.toHaveBeenCalled()
  })

  test("reports uncaught errors and rejections", async () => {
    captureUncaughtErrors()
    const error = new Error("click handler failed")
    listeners.error({ error })
    listeners.unhandledrejection({ reason: "fetch failed" })
    await flush()

    expect(mockCaptureException).toHaveBeenCalledWith(error, { source: "window.error" })
    expect(mockCaptureException).toHaveBeenCalledWith("fetch failed", { source: "unhandledrejection" })
  })

  test("ignores cross-origin script errors that carry no error object", async () => {
    captureUncaughtErrors()
    listeners.error({ message: "Script error." })
    await flush()

    expect(mockInit).not.toHaveBeenCalled()
  })

  test("listens to nothing without a key", () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = ""
    captureUncaughtErrors()
    expect(listeners).toEqual({})
  })
})
