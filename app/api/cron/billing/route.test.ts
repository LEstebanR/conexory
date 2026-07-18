import { describe, test, expect, mock, beforeEach } from "bun:test"

process.env.CRON_SECRET = "test-cron-secret"

type SubRow = Record<string, unknown>

const mockSubFindMany = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<SubRow[]>([])
})
const mockSubUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
const mockUserFindMany = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<SubRow[]>([])
})
const mockUserUpdate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})

mock.module("@/lib/prisma", () => ({
  prisma: {
    subscription: { findMany: mockSubFindMany, update: mockSubUpdate },
    user: { findMany: mockUserFindMany, update: mockUserUpdate },
  },
}))

const mockChargeRecurringPayment = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<{ ok: boolean }>({ ok: true })
})
// Spread the real module so verifyWompiEvent (needed by other test files)
// stays real — mock.module() replaces "@/lib/wompi" process-wide.
const realWompi = await import("@/lib/wompi")
mock.module("@/lib/wompi", () => ({
  ...realWompi,
  chargeRecurringPayment: mockChargeRecurringPayment,
  makeSubscriptionReference: (userId: string) => `ref-${userId}`,
}))

const mockDowngradeToFree = mock((...args: [string]) => {
  void args
  return Promise.resolve()
})
mock.module("@/lib/subscription", () => ({
  downgradeToFree: mockDowngradeToFree,
}))

const mockSendRenewalReminder = mock((...args: [unknown, unknown, unknown, unknown]) => {
  void args
  return Promise.resolve()
})
const mockSendSubscriptionCancelled = mock((...args: [unknown, unknown]) => {
  void args
  return Promise.resolve()
})
// Spread the real module so unrelated exports (sendSubscriptionConfirmation,
// sendPaymentFailed, needed by the Wompi webhook's tests) stay real —
// mock.module() replaces "@/lib/email" process-wide, not just for this file.
const realEmail = await import("@/lib/email")
mock.module("@/lib/email", () => ({
  ...realEmail,
  sendRenewalReminder: mockSendRenewalReminder,
  sendSubscriptionCancelled: mockSendSubscriptionCancelled,
}))

const { GET } = await import("./route")

function authedRequest(): Request {
  return new Request("https://conexory.com/api/cron/billing", {
    headers: { authorization: "Bearer test-cron-secret" },
  })
}

beforeEach(() => {
  mockSubFindMany.mockImplementation(() => Promise.resolve([]))
  mockSubUpdate.mockClear()
  mockUserFindMany.mockImplementation(() => Promise.resolve([]))
  mockUserUpdate.mockClear()
  mockChargeRecurringPayment.mockImplementation(() => Promise.resolve({ ok: true }))
  mockDowngradeToFree.mockClear()
  mockSendRenewalReminder.mockImplementation(() => Promise.resolve())
  mockSendRenewalReminder.mockClear()
  mockSendSubscriptionCancelled.mockImplementation(() => Promise.resolve())
  mockSendSubscriptionCancelled.mockClear()
})

describe("GET /api/cron/billing — auth", () => {
  test("returns 401 without a bearer token", async () => {
    const res = await GET(new Request("https://conexory.com/api/cron/billing"))
    expect(res.status).toBe(401)
  })

  test("returns 401 with the wrong token", async () => {
    const res = await GET(
      new Request("https://conexory.com/api/cron/billing", {
        headers: { authorization: "Bearer wrong" },
      })
    )
    expect(res.status).toBe(401)
  })

  test("returns 200 with a summary when authorized", async () => {
    const res = await GET(authedRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({
      ok: true,
      reminded: 0,
      charged: 0,
      pastDue: 0,
      downgraded: 0,
      canceled: 0,
      manualExpired: 0,
    })
  })
})

describe("sendReminders", () => {
  test("sends a reminder and stamps renewalReminderSentAt for a due subscription", async () => {
    mockSubFindMany.mockImplementation((args: unknown) => {
      const where = (args as { where: Record<string, unknown> }).where
      if (where.status === "active" && "renewalReminderSentAt" in where) {
        return Promise.resolve([
          {
            id: "sub-1",
            currentPeriodEnd: new Date(),
            wompiPaymentSourceId: 42,
            user: { email: "a@b.com", name: "Ana" },
          },
        ])
      }
      return Promise.resolve([])
    })
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.reminded).toBe(1)
    expect(mockSendRenewalReminder).toHaveBeenCalledWith("a@b.com", "Ana", expect.any(Date), true)
    expect(mockSubUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "sub-1" }, data: expect.objectContaining({ renewalReminderSentAt: expect.any(Date) }) })
    )
  })

  test("skips a row with no currentPeriodEnd without crashing", async () => {
    mockSubFindMany.mockImplementation((args: unknown) => {
      const where = (args as { where: Record<string, unknown> }).where
      if (where.status === "active" && "renewalReminderSentAt" in where) {
        return Promise.resolve([
          { id: "sub-1", currentPeriodEnd: null, wompiPaymentSourceId: null, user: { email: "a@b.com", name: "Ana" } },
        ])
      }
      return Promise.resolve([])
    })
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.reminded).toBe(0)
    expect(mockSendRenewalReminder).not.toHaveBeenCalled()
  })

  test("still stamps renewalReminderSentAt even if the email send fails", async () => {
    mockSubFindMany.mockImplementation((args: unknown) => {
      const where = (args as { where: Record<string, unknown> }).where
      if (where.status === "active" && "renewalReminderSentAt" in where) {
        return Promise.resolve([
          { id: "sub-1", currentPeriodEnd: new Date(), wompiPaymentSourceId: null, user: { email: "a@b.com", name: "Ana" } },
        ])
      }
      return Promise.resolve([])
    })
    mockSendRenewalReminder.mockImplementation(() => Promise.reject(new Error("resend down")))
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.reminded).toBe(1)
  })
})

describe("chargeRenewals", () => {
  function withDueSubs(subs: SubRow[]) {
    mockSubFindMany.mockImplementation((args: unknown) => {
      const where = (args as { where: Record<string, unknown> }).where
      if (where.status === "active" && "currentPeriodEnd" in where && !("renewalReminderSentAt" in where)) {
        return Promise.resolve(subs)
      }
      return Promise.resolve([])
    })
  }

  test("marks past_due (no retries) when there's no saved payment source", async () => {
    withDueSubs([
      {
        id: "sub-1",
        userId: "u1",
        currentPeriodEnd: new Date(),
        wompiPaymentSourceId: null,
        wompiPaymentSourceType: null,
        lastChargeAt: null,
        pastDueSince: null,
        user: { email: "a@b.com", name: "Ana" },
      },
    ])
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.pastDue).toBe(1)
    expect(mockSubUpdate).toHaveBeenCalledWith({
      where: { id: "sub-1" },
      data: { status: "past_due", pastDueSince: expect.any(Date) },
    })
    expect(mockChargeRecurringPayment).not.toHaveBeenCalled()
  })

  test("does not re-mark or re-count a sub that's already past_due", async () => {
    withDueSubs([
      {
        id: "sub-1",
        userId: "u1",
        currentPeriodEnd: new Date(),
        wompiPaymentSourceId: null,
        wompiPaymentSourceType: null,
        lastChargeAt: null,
        pastDueSince: new Date(),
        user: { email: "a@b.com", name: "Ana" },
      },
    ])
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.pastDue).toBe(0)
    expect(mockSubUpdate).not.toHaveBeenCalled()
  })

  test("skips charging when a renewal attempt is already pending a webhook", async () => {
    const periodEnd = new Date("2026-01-01T00:00:00Z")
    withDueSubs([
      {
        id: "sub-1",
        userId: "u1",
        currentPeriodEnd: periodEnd,
        wompiPaymentSourceId: 42,
        wompiPaymentSourceType: "CARD",
        lastChargeAt: new Date("2026-01-01T00:05:00Z"),
        pastDueSince: null,
        user: { email: "a@b.com", name: "Ana" },
      },
    ])
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.charged).toBe(0)
    expect(mockChargeRecurringPayment).not.toHaveBeenCalled()
  })

  test("charges a due subscription with a saved source and stamps lastChargeAt", async () => {
    withDueSubs([
      {
        id: "sub-1",
        userId: "u1",
        currentPeriodEnd: new Date(),
        wompiPaymentSourceId: 42,
        wompiPaymentSourceType: "NEQUI",
        lastChargeAt: null,
        pastDueSince: null,
        user: { email: "a@b.com", name: "Ana" },
      },
    ])
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.charged).toBe(1)
    expect(mockChargeRecurringPayment).toHaveBeenCalledWith({
      paymentSourceId: 42,
      reference: "ref-u1",
      customerEmail: "a@b.com",
      type: "NEQUI",
    })
    expect(mockSubUpdate).toHaveBeenCalledWith({
      where: { id: "sub-1" },
      data: { lastChargeAt: expect.any(Date) },
    })
  })

  test("stamps lastChargeAt but doesn't count a declined charge", async () => {
    withDueSubs([
      {
        id: "sub-1",
        userId: "u1",
        currentPeriodEnd: new Date(),
        wompiPaymentSourceId: 42,
        wompiPaymentSourceType: "CARD",
        lastChargeAt: null,
        pastDueSince: null,
        user: { email: "a@b.com", name: "Ana" },
      },
    ])
    mockChargeRecurringPayment.mockImplementation(() => Promise.resolve({ ok: false }))
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.charged).toBe(0)
    expect(mockSubUpdate).toHaveBeenCalledWith({
      where: { id: "sub-1" },
      data: { lastChargeAt: expect.any(Date) },
    })
  })
})

describe("expireCanceled", () => {
  test("downgrades to free and marks the subscription cancelled", async () => {
    mockSubFindMany.mockImplementation((args: unknown) => {
      const where = (args as { where: Record<string, unknown> }).where
      if (where.status === "canceling") {
        return Promise.resolve([{ id: "sub-1", userId: "u1" }])
      }
      return Promise.resolve([])
    })
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.canceled).toBe(1)
    expect(mockDowngradeToFree).toHaveBeenCalledWith("u1")
    expect(mockSubUpdate).toHaveBeenCalledWith({
      where: { id: "sub-1" },
      data: { status: "cancelled" },
    })
  })
})

describe("downgradeExpired", () => {
  test("downgrades, marks expired, and emails the user", async () => {
    mockSubFindMany.mockImplementation((args: unknown) => {
      const where = (args as { where: Record<string, unknown> }).where
      if (where.status === "past_due") {
        return Promise.resolve([{ id: "sub-1", userId: "u1", user: { email: "a@b.com", name: "Ana" } }])
      }
      return Promise.resolve([])
    })
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.downgraded).toBe(1)
    expect(mockDowngradeToFree).toHaveBeenCalledWith("u1")
    expect(mockSubUpdate).toHaveBeenCalledWith({ where: { id: "sub-1" }, data: { status: "expired" } })
    expect(mockSendSubscriptionCancelled).toHaveBeenCalledWith("a@b.com", "Ana")
  })

  test("still downgrades even if the cancellation email fails", async () => {
    mockSubFindMany.mockImplementation((args: unknown) => {
      const where = (args as { where: Record<string, unknown> }).where
      if (where.status === "past_due") {
        return Promise.resolve([{ id: "sub-1", userId: "u1", user: { email: "a@b.com", name: "Ana" } }])
      }
      return Promise.resolve([])
    })
    mockSendSubscriptionCancelled.mockImplementation(() => Promise.reject(new Error("resend down")))
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.downgraded).toBe(1)
  })
})

describe("expireManualPro", () => {
  test("only clears premiumUntil when a real subscription is still active", async () => {
    mockUserFindMany.mockImplementation(() =>
      Promise.resolve([{ id: "u1", subscription: { status: "active" } }])
    )
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.manualExpired).toBe(1)
    expect(mockDowngradeToFree).not.toHaveBeenCalled()
    expect(mockUserUpdate).toHaveBeenCalledWith({ where: { id: "u1" }, data: { premiumUntil: null } })
  })

  test("clears premiumUntil for a canceling subscription too", async () => {
    mockUserFindMany.mockImplementation(() =>
      Promise.resolve([{ id: "u1", subscription: { status: "canceling" } }])
    )
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.manualExpired).toBe(1)
    expect(mockDowngradeToFree).not.toHaveBeenCalled()
  })

  test("downgrades to free when there's no real subscription backing it", async () => {
    mockUserFindMany.mockImplementation(() => Promise.resolve([{ id: "u1", subscription: null }]))
    const res = await GET(authedRequest())
    const body = await res.json()
    expect(body.manualExpired).toBe(1)
    expect(mockDowngradeToFree).toHaveBeenCalledWith("u1")
    expect(mockUserUpdate).toHaveBeenCalledWith({ where: { id: "u1" }, data: { premiumUntil: null } })
  })
})
