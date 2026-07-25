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
            mpPreapprovalId: "preapproval-42",
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
          { id: "sub-1", currentPeriodEnd: null, mpPreapprovalId: null, user: { email: "a@b.com", name: "Ana" } },
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
          { id: "sub-1", currentPeriodEnd: new Date(), mpPreapprovalId: null, user: { email: "a@b.com", name: "Ana" } },
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
