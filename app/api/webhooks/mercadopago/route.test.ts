import { describe, test, expect, mock } from "bun:test"

const mockVerifyMercadoPagoWebhook = mock((...args: [unknown]) => {
  void args
  return true
})
type PaymentDetails = {
  ok: boolean
  status?: string
  externalReference?: string
  preapprovalId?: string
}
type PreapprovalDetails = {
  ok: boolean
  status?: string
  externalReference?: string
}
const mockGetPayment = mock((...args: [string]) => {
  void args
  return Promise.resolve<PaymentDetails>({ ok: true, status: "approved" })
})
const mockGetPreapproval = mock((...args: [string]) => {
  void args
  return Promise.resolve<PreapprovalDetails>({ ok: true, status: "cancelled" })
})

// Spread the real module so unrelated exports (makeExternalReference) stay
// real for any other test file that imports "@/lib/mercadopago" after this
// one — mock.module() replaces it process-wide, not just for this file.
const realMercadoPago = await import("@/lib/mercadopago")
mock.module("@/lib/mercadopago", () => ({
  ...realMercadoPago,
  verifyMercadoPagoWebhook: mockVerifyMercadoPagoWebhook,
  getPayment: mockGetPayment,
  getPreapproval: mockGetPreapproval,
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
// Spread the real module so unrelated exports (sendRenewalReminder,
// sendSubscriptionCancelled, needed by the billing cron's tests) stay real —
// mock.module() replaces "@/lib/email" process-wide, not just for this file.
const realEmail = await import("@/lib/email")
mock.module("@/lib/email", () => ({
  ...realEmail,
  sendSubscriptionConfirmation: mockSendSubscriptionConfirmation,
  sendPaymentFailed: mockSendPaymentFailed,
}))

const { POST } = await import("./route")

const userId = "cljabc123"
const reference = `pro-${userId}-1700000000`

function makeRequest(url: string, body: unknown): Request {
  return {
    url,
    headers: new Headers({ "x-signature": "ts=1,v1=x", "x-request-id": "req-1" }),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as unknown as Request
}

function paymentWebhook(dataId = "pay-1") {
  return makeRequest(`https://conexory.com/api/webhooks/mercadopago?type=payment&data.id=${dataId}`, {
    type: "payment",
    data: { id: dataId },
  })
}

function preapprovalWebhook(dataId = "preapproval-1") {
  return makeRequest(
    `https://conexory.com/api/webhooks/mercadopago?type=subscription_preapproval&data.id=${dataId}`,
    { type: "subscription_preapproval", data: { id: dataId } },
  )
}

describe("POST /api/webhooks/mercadopago", () => {
  test("returns 400 for invalid JSON", async () => {
    const res = await POST({
      url: "https://conexory.com/api/webhooks/mercadopago",
      headers: new Headers(),
      text: () => Promise.resolve("not json"),
    } as unknown as Request)
    expect(res.status).toBe(400)
  })

  test("returns 401 when the signature is invalid", async () => {
    mockVerifyMercadoPagoWebhook.mockImplementationOnce(() => false)
    const res = await POST(paymentWebhook())
    expect(res.status).toBe(401)
  })

  test("returns 200 without touching anything when dataId is missing", async () => {
    mockUserUpdate.mockClear()
    const res = await POST(
      makeRequest("https://conexory.com/api/webhooks/mercadopago?type=payment", { type: "payment" }),
    )
    expect(res.status).toBe(200)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("returns 200 silently on a duplicate event (idempotency)", async () => {
    mockGetPayment.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: "approved", externalReference: reference, preapprovalId: "pa-1" }),
    )
    mockPaymentEventCreate.mockImplementationOnce(() => Promise.reject({ code: "P2002" }))
    mockUserUpdate.mockClear()
    const res = await POST(paymentWebhook())
    expect(res.status).toBe(200)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("re-throws non-duplicate errors from paymentEvent.create", async () => {
    mockGetPayment.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: "approved", externalReference: reference, preapprovalId: "pa-1" }),
    )
    mockPaymentEventCreate.mockImplementationOnce(() => Promise.reject(new Error("db down")))
    await expect(POST(paymentWebhook())).rejects.toThrow("db down")
  })

  test("approved payment activates the user and creates an active subscription", async () => {
    mockGetPayment.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: "approved", externalReference: reference, preapprovalId: "pa-1" }),
    )
    mockSubscriptionFindUnique.mockImplementationOnce(() => Promise.resolve(null))
    mockUserUpdate.mockClear()
    mockSubscriptionUpsert.mockClear()
    mockSendSubscriptionConfirmation.mockClear()
    const res = await POST(paymentWebhook())
    expect(res.status).toBe(200)
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: userId }, data: { isPremium: true } })
    )
    const [call] = mockSubscriptionUpsert.mock.calls
    expect((call[0] as { create: { status: string } }).create.status).toBe("active")
    expect(mockSendSubscriptionConfirmation).toHaveBeenCalledTimes(1)
  })

  test("does not send a confirmation email for a renewal of an active subscription", async () => {
    mockGetPayment.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: "approved", externalReference: reference, preapprovalId: "pa-1" }),
    )
    mockSubscriptionFindUnique.mockImplementationOnce(() =>
      Promise.resolve({ currentPeriodEnd: new Date(Date.now() + 86_400_000), status: "active" })
    )
    mockSendSubscriptionConfirmation.mockClear()
    await POST(paymentWebhook())
    expect(mockSendSubscriptionConfirmation).not.toHaveBeenCalled()
  })

  test("ignores a late approval for a subscription the user already cancelled", async () => {
    mockGetPayment.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: "approved", externalReference: reference, preapprovalId: "pa-1" }),
    )
    mockSubscriptionFindUnique.mockImplementationOnce(() =>
      Promise.resolve({ currentPeriodEnd: null, status: "cancelled" })
    )
    mockUserUpdate.mockClear()
    mockSubscriptionUpsert.mockClear()
    await POST(paymentWebhook())
    expect(mockUserUpdate).not.toHaveBeenCalled()
    expect(mockSubscriptionUpsert).not.toHaveBeenCalled()
  })

  test("does nothing when the reference can't be resolved to a user", async () => {
    mockGetPayment.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: "approved", externalReference: "not-a-valid-reference", preapprovalId: "pa-1" }),
    )
    mockUserUpdate.mockClear()
    const res = await POST(paymentWebhook())
    expect(res.status).toBe(200)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  test("rejected payment marks the subscription past_due and emails the user", async () => {
    mockGetPayment.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: "rejected", externalReference: reference }),
    )
    mockSubscriptionUpdateMany.mockImplementationOnce(() => Promise.resolve({ count: 1 }))
    mockSendPaymentFailed.mockClear()
    const res = await POST(paymentWebhook())
    expect(res.status).toBe(200)
    expect(mockSubscriptionUpdateMany).toHaveBeenCalledWith({
      where: { userId, pastDueSince: null },
      data: { status: "past_due", pastDueSince: expect.any(Date) },
    })
    expect(mockSendPaymentFailed).toHaveBeenCalledTimes(1)
  })

  test("does not resend the payment-failed email for a second decline in the same cycle", async () => {
    mockGetPayment.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: "rejected", externalReference: reference }),
    )
    mockSubscriptionUpdateMany.mockImplementationOnce(() => Promise.resolve({ count: 0 }))
    mockSendPaymentFailed.mockClear()
    await POST(paymentWebhook())
    expect(mockSendPaymentFailed).not.toHaveBeenCalled()
  })

  test("subscription_preapproval cancelled moves an active subscription to canceling", async () => {
    mockGetPreapproval.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: "cancelled", externalReference: reference }),
    )
    mockSubscriptionUpdateMany.mockClear()
    const res = await POST(preapprovalWebhook())
    expect(res.status).toBe(200)
    expect(mockSubscriptionUpdateMany).toHaveBeenCalledWith({
      where: { userId, status: { in: ["active", "past_due", "incomplete"] } },
      data: { status: "canceling" },
    })
  })

  test("subscription_preapproval paused marks the subscription past_due", async () => {
    mockGetPreapproval.mockImplementationOnce(() =>
      Promise.resolve({ ok: true, status: "paused", externalReference: reference }),
    )
    mockSubscriptionUpdateMany.mockImplementationOnce(() => Promise.resolve({ count: 1 }))
    mockSendPaymentFailed.mockClear()
    const res = await POST(preapprovalWebhook())
    expect(res.status).toBe(200)
    expect(mockSendPaymentFailed).toHaveBeenCalledTimes(1)
  })
})
