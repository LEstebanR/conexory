import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test"

const mockInit = mock((...args: [string, Record<string, unknown>]) => void args)
const mockCaptureException = mock((...args: [unknown, unknown]) => void args)
const mockRegister = mock((...args: [Record<string, unknown>]) => void args)

mock.module("posthog-js", () => ({
  default: { init: mockInit, captureException: mockCaptureException, register: mockRegister },
}))

const {
  loadPostHog,
  captureClientError,
  captureBoundaryError,
  captureUncaughtErrors,
  stripUrlQueries,
  resetPostHogClientForTests,
} = await import(
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
  mockRegister.mockClear()
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
      before_send: stripUrlQueries,
    })
  })

  test("tags every event with the environment and release", async () => {
    await loadPostHog()
    expect(mockRegister).toHaveBeenCalledTimes(1)
    expect(Object.keys(mockRegister.mock.calls[0][0]).sort()).toEqual(["environment", "release"])
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

  test("retries after a failed load instead of staying off", async () => {
    mockInit.mockImplementationOnce(() => {
      throw new Error("chunk failed")
    })
    expect(await loadPostHog()).toBeNull()
    expect(await loadPostHog()).not.toBeNull()
    expect(mockInit).toHaveBeenCalledTimes(2)
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

  test("never rejects, so it can't retrigger the unhandledrejection listener", async () => {
    mockCaptureException.mockImplementationOnce(() => {
      throw new Error("bad reason object")
    })
    await expect(captureClientError({})).resolves.toBeUndefined()
  })
})

describe("captureBoundaryError", () => {
  test("reports client-side errors with their boundary", async () => {
    const error = new Error("render failed")
    captureBoundaryError(error, "dashboard")
    await flush()
    expect(mockCaptureException).toHaveBeenCalledWith(error, { boundary: "dashboard" })
  })

  test("skips server errors, which onRequestError already reported", async () => {
    captureBoundaryError(Object.assign(new Error("redacted"), { digest: "123" }), "root")
    await flush()
    expect(mockInit).not.toHaveBeenCalled()
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

describe("stripUrlQueries", () => {
  test("drops query strings that can carry secrets from page URLs and referrers", () => {
    const event = {
      uuid: "1",
      event: "$exception",
      properties: {
        $current_url: "https://conexory.com/reset-password?token=abc123",
        $referrer: "https://www.mercadopago.com.co/checkout?preapproval_id=pa-1",
        $exception_list: [],
      },
      $set_once: { $initial_current_url: "https://conexory.com/reset-password?token=abc123#form" },
    }

    const result = stripUrlQueries(event as never)

    expect(result?.properties.$current_url).toBe("https://conexory.com/reset-password")
    expect(result?.properties.$referrer).toBe("https://www.mercadopago.com.co/checkout")
    expect(result?.properties.$exception_list).toEqual([])
    expect(result?.$set_once?.$initial_current_url).toBe("https://conexory.com/reset-password")
  })

  test("passes a dropped event through", () => {
    expect(stripUrlQueries(null)).toBeNull()
  })
})
