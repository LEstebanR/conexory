import { describe, test, expect, mock } from "bun:test"

type Session = { user: { id: string; email: string; isPremium: boolean } } | null

const mockGetSession = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<Session>({
    user: { id: "u1", email: "a@b.com", isPremium: false },
  })
})
mock.module("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}))

const mockActivateSubscription = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<{ ok: true } | { ok: false; reason: string }>({ ok: true })
})
mock.module("@/lib/subscription", () => ({
  activateSubscription: mockActivateSubscription,
}))

// next/headers is mocked globally in test-setup.ts.

const { POST } = await import("./route")

function makeRequest(fields?: Record<string, string>): Request {
  const formData = fields
    ? (() => {
        const fd = new FormData()
        for (const [k, v] of Object.entries(fields)) fd.set(k, v)
        return fd
      })()
    : null
  return {
    url: "https://conexory.com/api/subscription/tokenize",
    formData: () => (formData ? Promise.resolve(formData) : Promise.reject(new Error("no body"))),
  } as unknown as Request
}

function location(res: Response): string {
  return new URL(res.headers.get("location") ?? "").pathname + new URL(res.headers.get("location") ?? "").search
}

describe("POST /api/subscription/tokenize", () => {
  test("redirects to /login when unauthenticated", async () => {
    mockGetSession.mockImplementationOnce(() => Promise.resolve(null))
    const res = await POST(makeRequest({ payment_source_token: "tok" }))
    expect(res.status).toBe(303)
    expect(location(res)).toBe("/login")
  })

  test("redirects to /dashboard when already premium", async () => {
    mockGetSession.mockImplementationOnce(() =>
      Promise.resolve({ user: { id: "u1", email: "a@b.com", isPremium: true } })
    )
    const res = await POST(makeRequest({ payment_source_token: "tok" }))
    expect(res.status).toBe(303)
    expect(location(res)).toBe("/dashboard")
  })

  test("redirects with error=card when no token is present", async () => {
    const res = await POST(makeRequest())
    expect(location(res)).toBe("/dashboard/upgrade?error=card")
  })

  test("activates with CARD by default and redirects to processing on success", async () => {
    mockActivateSubscription.mockClear()
    const res = await POST(makeRequest({ payment_source_token: "tok" }))
    expect(location(res)).toBe("/dashboard?upgrade=processing")
    expect(mockActivateSubscription).toHaveBeenCalledWith({
      userId: "u1",
      email: "a@b.com",
      token: "tok",
      type: "CARD",
    })
  })

  test("activates with NEQUI when payment_source_type is NEQUI", async () => {
    mockActivateSubscription.mockClear()
    await POST(makeRequest({ payment_source_token: "tok", payment_source_type: "NEQUI" }))
    expect(mockActivateSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ type: "NEQUI" })
    )
  })

  test("redirects with the failure reason when activation fails", async () => {
    mockActivateSubscription.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, reason: "charge_failed" })
    )
    const res = await POST(makeRequest({ payment_source_token: "tok" }))
    expect(location(res)).toBe("/dashboard/upgrade?error=charge_failed")
  })

  test("redirects with error=card when the request has no form body", async () => {
    const req = { url: "https://conexory.com/api/subscription/tokenize", formData: () => Promise.reject(new Error("bad body")) } as unknown as Request
    const res = await POST(req)
    expect(location(res)).toBe("/dashboard/upgrade?error=card")
  })
})
