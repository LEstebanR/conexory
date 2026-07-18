import { describe, test, expect, mock } from "bun:test"

const mockVerifyWompiEvent = mock((...args: [unknown]) => {
  void args
  return true
})
// Spread the real module so unrelated exports (createPaymentSource,
// makeSubscriptionReference) stay real for any other test file that imports
// "@/lib/wompi" after this one — mock.module replaces it process-wide, not
// just for this file.
const realWompi = await import("@/lib/wompi")
mock.module("@/lib/wompi", () => ({
  ...realWompi,
  verifyWompiEvent: mockVerifyWompiEvent,
}))

const mockPaymentEventCreate = mock((...args: [{ data: Record<string, unknown> }]) => {
  void args
  return Promise.resolve({})
})
const mockPaymentEventUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
const mockSubscriptionFindUnique = mock(() =>
  Promise.resolve<{ currentPeriodEnd: Date | null; status: string } | null>(null)
)
const mockSubscriptionUpsert = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
const mockSubscriptionUpdateMany = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({ count: 1 })
})
const mockUserUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({ email: "u@example.com", name: "User" })
})
const mockUserFindUnique = mock(() =>
  Promise.resolve<{ email: string; name: string } | null>({ email: "u@example.com", name: "User" })
)

mock.module("@/lib/prisma", () => ({
  prisma: {
    paymentEvent: { create: mockPaymentEventCreate, update: mockPaymentEventUpdate },
    subscription: {
      findUnique: mockSubscriptionFindUnique,
      upsert: mockSubscriptionUpsert,
      updateMany: mockSubscriptionUpdateMany,
    },
    user: { update: mockUserUpdate, findUnique: mockUserFindUnique },
  },
}))

const mockSendSubscriptionConfirmation = mock((...args: [string, string]) => {
  void args
  return Promise.resolve()
})
const mockSendPaymentFailed = mock((...args: [string, string]) => {
  void args
  return Promise.resolve()
})
mock.module("@/lib/email", () => ({
  sendSubscriptionConfirmation: mockSendSubscriptionConfirmation,
  sendPaymentFailed: mockSendPaymentFailed,
}))

const { POST } = await import("./route")

function makeRequest(body: unknown): Request {
  return { text: () => Promise.resolve(JSON.stringify(body)) } as unknown as Request
}

const userId = "cljabc123"
const reference = `pro-${userId}-1700000000`

function approvedEvent(overrides: Partial<{ status: string }> = {}) {
  return {
    event: "transaction.updated",
    data: {
      transaction: {
        id: "tx-1",
        reference,
        status: "APPROVED",
        amount_in_cents: 9_999_900,
        payment_source_id: 42,
        ...overrides,
      },
    },
    signature: { properties: [], checksum: "x" },
    timestamp: 1700000000,
  }
}

describe("POST /api/webhooks/wompi", () => {
  test("returns 400 for invalid JSON", async () => {
    const res = await POST({ text: () => Promise.resolve("not json") } as unknown as Request)
    expect(res.status).toBe(400)
  })

  test("returns 401 when the signature is invalid", async () => {
    mockVerifyWompiEvent.mockImplementationOnce(() => false)
    const res = await POST(makeRequest(approvedEvent()))
    expect(res.status).toBe(401)
  })

  test("returns 200 silently on a duplicate event (idempotency)", async () => {
    mockPaymentEventCreate.mockImplementationOnce(() =>
      Promise.reject({ code: "P2002" })
    )
    mockUserUpdate.mockClear()
    const res = await POST(makeRequest(approvedEvent()))
    expect(res.status).toBe(200)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("re-throws non-duplicate errors from paymentEvent.create", async () => {
    mockPaymentEventCreate.mockImplementationOnce(() => Promise.reject(new Error("db down")))
    await expect(POST(makeRequest(approvedEvent()))).rejects.toThrow("db down")
  })

  test("approved transaction activates the user and creates an active subscription", async () => {
    mockSubscriptionFindUnique.mockImplementationOnce(() => Promise.resolve(null))
    mockUserUpdate.mockClear()
    mockSubscriptionUpsert.mockClear()
    mockSendSubscriptionConfirmation.mockClear()
    const res = await POST(makeRequest(approvedEvent()))
    expect(res.status).toBe(200)
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: userId }, data: { isPremium: true } })
    )
    const [call] = mockSubscriptionUpsert.mock.calls
    expect((call[0] as { create: { status: string } }).create.status).toBe("active")
    expect(mockSendSubscriptionConfirmation).toHaveBeenCalledTimes(1)
  })

  test("still returns 200 if linking the event to the user fails", async () => {
    mockSubscriptionFindUnique.mockImplementationOnce(() => Promise.resolve(null))
    mockPaymentEventUpdate.mockImplementationOnce(() => Promise.reject(new Error("db down")))
    const res = await POST(makeRequest(approvedEvent()))
    expect(res.status).toBe(200)
  })

  test("still returns 200 if the confirmation email fails to send", async () => {
    mockSubscriptionFindUnique.mockImplementationOnce(() => Promise.resolve(null))
    mockSendSubscriptionConfirmation.mockImplementationOnce(() =>
      Promise.reject(new Error("resend down"))
    )
    const res = await POST(makeRequest(approvedEvent()))
    expect(res.status).toBe(200)
  })

  test("does not send a confirmation email for a renewal of an active subscription", async () => {
    mockSubscriptionFindUnique.mockImplementationOnce(() =>
      Promise.resolve({ currentPeriodEnd: new Date(Date.now() + 86_400_000), status: "active" })
    )
    mockSendSubscriptionConfirmation.mockClear()
    await POST(makeRequest(approvedEvent()))
    expect(mockSendSubscriptionConfirmation).not.toHaveBeenCalled()
  })

  test("ignores a late approval for a subscription the user already cancelled", async () => {
    mockSubscriptionFindUnique.mockImplementationOnce(() =>
      Promise.resolve({ currentPeriodEnd: null, status: "cancelled" })
    )
    mockUserUpdate.mockClear()
    mockSubscriptionUpsert.mockClear()
    await POST(makeRequest(approvedEvent()))
    expect(mockUserUpdate).not.toHaveBeenCalled()
    expect(mockSubscriptionUpsert).not.toHaveBeenCalled()
  })

  test("does nothing when the reference can't be resolved to a user", async () => {
    mockUserUpdate.mockClear()
    const event = approvedEvent()
    event.data.transaction.reference = "not-a-valid-reference"
    const res = await POST(makeRequest(event))
    expect(res.status).toBe(200)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("declined transaction marks the subscription past_due and emails the user", async () => {
    mockSubscriptionUpdateMany.mockImplementationOnce(() => Promise.resolve({ count: 1 }))
    mockSendPaymentFailed.mockClear()
    const event = approvedEvent({ status: "DECLINED" })
    const res = await POST(makeRequest(event))
    expect(res.status).toBe(200)
    expect(mockSubscriptionUpdateMany).toHaveBeenCalledWith({
      where: { userId, pastDueSince: null },
      data: { status: "past_due", pastDueSince: expect.any(Date) },
    })
    expect(mockSendPaymentFailed).toHaveBeenCalledTimes(1)
  })

  test("still returns 200 if the payment-failed email fails to send", async () => {
    mockSubscriptionUpdateMany.mockImplementationOnce(() => Promise.resolve({ count: 1 }))
    mockSendPaymentFailed.mockImplementationOnce(() => Promise.reject(new Error("resend down")))
    const event = approvedEvent({ status: "DECLINED" })
    const res = await POST(makeRequest(event))
    expect(res.status).toBe(200)
  })

  test("does not resend the payment-failed email for a second decline in the same cycle", async () => {
    mockSubscriptionUpdateMany.mockImplementationOnce(() => Promise.resolve({ count: 0 }))
    mockSendPaymentFailed.mockClear()
    const event = approvedEvent({ status: "DECLINED" })
    await POST(makeRequest(event))
    expect(mockSendPaymentFailed).not.toHaveBeenCalled()
  })

  test("subscription.cancelled moves an active subscription to canceling", async () => {
    mockSubscriptionUpdateMany.mockClear()
    const event = {
      event: "subscription.cancelled",
      data: { subscription: { id: "sub-1", reference, status: "CANCELLED" } },
      signature: { properties: [], checksum: "x" },
      timestamp: 1700000001,
    }
    const res = await POST(makeRequest(event))
    expect(res.status).toBe(200)
    expect(mockSubscriptionUpdateMany).toHaveBeenCalledWith({
      where: { userId, status: { in: ["active", "past_due", "incomplete"] } },
      data: { status: "canceling" },
    })
  })
})
