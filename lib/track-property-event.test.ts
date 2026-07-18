import { describe, test, expect, mock, afterEach } from "bun:test"
import { trackPropertyEvent } from "./track-property-event"

const originalNavigator = global.navigator
const originalFetch = global.fetch

afterEach(() => {
  Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true })
  global.fetch = originalFetch
})

describe("trackPropertyEvent", () => {
  test("uses sendBeacon when available", () => {
    const mockSendBeacon = mock((...args: [string, string]) => {
      void args
      return true
    })
    Object.defineProperty(global, "navigator", {
      value: { sendBeacon: mockSendBeacon },
      configurable: true,
    })
    const mockFetch = mock((...args: [unknown]) => {
      void args
      return Promise.resolve(new Response())
    })
    global.fetch = mockFetch as unknown as typeof fetch

    trackPropertyEvent("p1", "whatsapp_click")

    expect(mockSendBeacon).toHaveBeenCalledWith(
      "/api/properties/p1/event",
      JSON.stringify({ type: "whatsapp_click" })
    )
    expect(mockFetch).not.toHaveBeenCalled()
  })

  test("falls back to fetch with keepalive when sendBeacon is unavailable", () => {
    Object.defineProperty(global, "navigator", { value: {}, configurable: true })
    const mockFetch = mock((...args: [string, unknown]) => {
      void args
      return Promise.resolve(new Response())
    })
    global.fetch = mockFetch as unknown as typeof fetch

    trackPropertyEvent("p1", "contact_phone_click")

    expect(mockFetch).toHaveBeenCalledWith("/api/properties/p1/event", {
      method: "POST",
      body: JSON.stringify({ type: "contact_phone_click" }),
      keepalive: true,
    })
  })

  test("swallows a fetch rejection instead of throwing", () => {
    Object.defineProperty(global, "navigator", { value: {}, configurable: true })
    global.fetch = mock(() => Promise.reject(new Error("network down"))) as unknown as typeof fetch

    expect(() => trackPropertyEvent("p1", "whatsapp_click")).not.toThrow()
  })
})
