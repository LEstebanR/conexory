import { describe, test, expect, mock, beforeEach, afterAll, spyOn } from "bun:test"
import { Prisma } from "@prisma/client"
import * as email from "@/lib/email"

type UserRow = { id: string; email: string; name: string; isPremium: boolean; lifecycleEmailsOptOut: boolean }

const freeUser: UserRow = { id: "u1", email: "a@b.com", name: "Ana", isPremium: false, lifecycleEmailsOptOut: false }

const mockUserFindUnique = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<UserRow | null>(freeUser)
})
const mockLifecycleCreate = mock((...args: [unknown]) => {
  void args
  return Promise.resolve({})
})
mock.module("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: mockUserFindUnique },
    lifecycleEmail: { create: mockLifecycleCreate },
  },
}))

const mockConsoleError = spyOn(console, "error").mockImplementation(() => {})
const mockSendLimitReached = spyOn(email, "sendPropertyLimitReached").mockImplementation(() => Promise.resolve())
afterAll(() => {
  mockSendLimitReached.mockRestore()
  mockConsoleError.mockRestore()
})

const { claimLifecycleEmail, notifyIfReachedFreeLimit } = await import("./lifecycle")

function uniqueViolation() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", { code: "P2002", clientVersion: "test" })
}

beforeEach(() => {
  mockUserFindUnique.mockImplementation(() => Promise.resolve(freeUser))
  mockUserFindUnique.mockClear()
  mockLifecycleCreate.mockImplementation(() => Promise.resolve({}))
  mockLifecycleCreate.mockClear()
  mockSendLimitReached.mockClear()
  mockConsoleError.mockClear()
})

describe("claimLifecycleEmail", () => {
  test("claims an email that was never sent", async () => {
    expect(await claimLifecycleEmail("u1", "winback")).toBe(true)
    expect(mockLifecycleCreate).toHaveBeenCalledWith({ data: { userId: "u1", kind: "winback" } })
  })

  test("refuses when the email was already claimed", async () => {
    mockLifecycleCreate.mockImplementation(() => Promise.reject(uniqueViolation()))
    expect(await claimLifecycleEmail("u1", "winback")).toBe(false)
  })

  test("rethrows any other database error", async () => {
    mockLifecycleCreate.mockImplementation(() => Promise.reject(new Error("DB down")))
    await expect(claimLifecycleEmail("u1", "winback")).rejects.toThrow("DB down")
  })
})

describe("notifyIfReachedFreeLimit", () => {
  test("emails a Free user who just reached the limit", async () => {
    await notifyIfReachedFreeLimit("u1", 3, false)
    expect(mockLifecycleCreate).toHaveBeenCalledWith({ data: { userId: "u1", kind: "property_limit_reached" } })
    expect(mockSendLimitReached).toHaveBeenCalledWith(freeUser)
  })

  test("stays quiet below the limit", async () => {
    await notifyIfReachedFreeLimit("u1", 2, false)
    expect(mockUserFindUnique).not.toHaveBeenCalled()
    expect(mockSendLimitReached).not.toHaveBeenCalled()
  })

  test("stays quiet for users with Pro access", async () => {
    await notifyIfReachedFreeLimit("u1", 3, true)
    expect(mockSendLimitReached).not.toHaveBeenCalled()
  })

  test("skips users who opted out or are already Pro in the database", async () => {
    mockUserFindUnique.mockImplementation(() => Promise.resolve({ ...freeUser, lifecycleEmailsOptOut: true }))
    await notifyIfReachedFreeLimit("u1", 3, false)
    mockUserFindUnique.mockImplementation(() => Promise.resolve({ ...freeUser, isPremium: true }))
    await notifyIfReachedFreeLimit("u1", 3, false)
    mockUserFindUnique.mockImplementation(() => Promise.resolve(null))
    await notifyIfReachedFreeLimit("u1", 3, false)
    expect(mockLifecycleCreate).not.toHaveBeenCalled()
    expect(mockSendLimitReached).not.toHaveBeenCalled()
  })

  test("never sends twice", async () => {
    mockLifecycleCreate.mockImplementation(() => Promise.reject(uniqueViolation()))
    await notifyIfReachedFreeLimit("u1", 3, false)
    expect(mockSendLimitReached).not.toHaveBeenCalled()
  })

  test("reports a failure instead of throwing into the caller", async () => {
    mockUserFindUnique.mockImplementation(() => Promise.reject(new Error("DB down")))
    await expect(notifyIfReachedFreeLimit("u1", 3, false)).resolves.toBeUndefined()
    expect(mockSendLimitReached).not.toHaveBeenCalled()
  })
})
