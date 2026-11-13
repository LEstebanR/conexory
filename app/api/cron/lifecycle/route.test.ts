import { describe, test, expect, mock, beforeEach, afterAll, spyOn } from "bun:test"
import { Prisma } from "@prisma/client"
import * as email from "@/lib/email"
import * as errors from "@/lib/report-error"

process.env.CRON_SECRET = "test-cron-secret"

type Recipient = { id: string; email: string; name: string }
type Query = { where: Record<string, unknown>; take?: number }

const mockUserFindMany = mock((...args: [Query]) => {
  void args
  return Promise.resolve<Recipient[]>([])
})
const mockSubFindMany = mock((...args: [Query]) => {
  void args
  return Promise.resolve<{ user: Recipient }[]>([])
})
const mockLifecycleCreate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: mockUserFindMany },
    subscription: { findMany: mockSubFindMany },
    lifecycleEmail: { create: mockLifecycleCreate },
  },
}))

const mockSendReengagement = spyOn(email, "sendReengagement").mockImplementation(() => Promise.resolve())
const mockSendWinback = spyOn(email, "sendWinback").mockImplementation(() => Promise.resolve())
afterAll(() => {
  mockSendReengagement.mockRestore()
  mockSendWinback.mockRestore()
})

const { GET } = await import("./route")

const DAY = 24 * 60 * 60 * 1000
const ana: Recipient = { id: "u1", email: "ana@b.com", name: "Ana" }
const beto: Recipient = { id: "u2", email: "beto@b.com", name: "Beto" }

function authedRequest(): Request {
  return new Request("https://conexory.com/api/cron/lifecycle", {
    headers: { authorization: "Bearer test-cron-secret" },
  })
}

function daysAgo(date: unknown): number {
  return Math.round((Date.now() - (date as Date).getTime()) / DAY)
}

beforeEach(() => {
  mockUserFindMany.mockImplementation(() => Promise.resolve([]))
  mockUserFindMany.mockClear()
  mockSubFindMany.mockImplementation(() => Promise.resolve([]))
  mockSubFindMany.mockClear()
  mockLifecycleCreate.mockImplementation(() => Promise.resolve({}))
  mockLifecycleCreate.mockClear()
  mockSendReengagement.mockClear()
  mockSendWinback.mockClear()
})

describe("GET /api/cron/lifecycle — auth", () => {
  test("returns 401 without the cron secret", async () => {
    const res = await GET(new Request("https://conexory.com/api/cron/lifecycle"))
    expect(res.status).toBe(401)
    expect(mockUserFindMany).not.toHaveBeenCalled()
  })

  test("returns 401 when CRON_SECRET is unset", async () => {
    const secret = process.env.CRON_SECRET
    delete process.env.CRON_SECRET
    try {
      expect((await GET(authedRequest())).status).toBe(401)
    } finally {
      process.env.CRON_SECRET = secret
    }
  })
})

describe("reengagement", () => {
  test("targets recent Free signups with nothing published, opted in and not yet emailed", async () => {
    await GET(authedRequest())
    const { where, take } = mockUserFindMany.mock.calls[0][0]
    expect(where).toMatchObject({
      role: "user",
      isPremium: false,
      lifecycleEmailsOptOut: false,
      properties: { none: { published: true } },
      lifecycleEmails: { none: { kind: "reengagement" } },
    })
    const createdAt = where.createdAt as { gte: Date; lte: Date }
    expect(daysAgo(createdAt.lte)).toBe(3)
    expect(daysAgo(createdAt.gte)).toBe(10)
    expect(take).toBe(100)
  })

  test("claims and emails each candidate", async () => {
    mockUserFindMany.mockImplementation(() => Promise.resolve([ana, beto]))
    const body = await (await GET(authedRequest())).json()
    expect(body).toMatchObject({ ok: true, reengaged: 2, wonBack: 0 })
    expect(mockLifecycleCreate).toHaveBeenCalledWith({ data: { userId: "u1", kind: "reengagement" } })
    expect(mockSendReengagement).toHaveBeenCalledWith(ana)
    expect(mockSendReengagement).toHaveBeenCalledWith(beto)
  })

  test("skips a candidate already claimed by a concurrent run", async () => {
    mockUserFindMany.mockImplementation(() => Promise.resolve([ana, beto]))
    mockLifecycleCreate.mockImplementationOnce(() =>
      Promise.reject(new Prisma.PrismaClientKnownRequestError("dup", { code: "P2002", clientVersion: "test" })),
    )
    const body = await (await GET(authedRequest())).json()
    expect(body.reengaged).toBe(1)
    expect(mockSendReengagement).toHaveBeenCalledTimes(1)
    expect(mockSendReengagement).toHaveBeenCalledWith(beto)
  })
})

describe("send failures", () => {
  test("a failing send is reported and the next recipient still gets theirs", async () => {
    const mockReportError = spyOn(errors, "reportError").mockImplementation(() => Promise.resolve())
    try {
      mockUserFindMany.mockImplementation(() => Promise.resolve([ana, beto]))
      mockSendReengagement.mockImplementationOnce(() => Promise.reject(new Error("render failed")))
      const res = await GET(authedRequest())
      expect(res.status).toBe(200)
      expect((await res.json()).reengaged).toBe(1)
      expect(mockSendReengagement).toHaveBeenCalledWith(beto)
      expect(mockReportError).toHaveBeenCalledWith(
        "Lifecycle email failed: reengagement",
        expect.any(Error),
        { userId: "u1" },
      )
    } finally {
      mockReportError.mockRestore()
    }
  })
})

describe("winback", () => {
  test("targets subscriptions that ended 14 to 21 days ago for users still on Free", async () => {
    await GET(authedRequest())
    const { where, take } = mockSubFindMany.mock.calls[0][0]
    expect(where).toMatchObject({
      status: { in: ["cancelled", "expired"] },
      user: {
        isPremium: false,
        lifecycleEmailsOptOut: false,
        lifecycleEmails: { none: { kind: "winback" } },
      },
    })
    const endedAt = where.endedAt as { gte: Date; lte: Date }
    expect(daysAgo(endedAt.lte)).toBe(14)
    expect(daysAgo(endedAt.gte)).toBe(21)
    expect(take).toBe(100)
  })

  test("claims and emails each former Pro user", async () => {
    mockSubFindMany.mockImplementation(() => Promise.resolve([{ user: ana }]))
    const body = await (await GET(authedRequest())).json()
    expect(body.wonBack).toBe(1)
    expect(mockLifecycleCreate).toHaveBeenCalledWith({ data: { userId: "u1", kind: "winback" } })
    expect(mockSendWinback).toHaveBeenCalledWith(ana)
  })
})
