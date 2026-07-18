import { describe, test, expect, mock, beforeEach } from "bun:test"
import type { NextRequest } from "next/server"

const mockPropertyFindUnique = mock((...args: [unknown]) => {
  void args
  return Promise.resolve<{ id: string; published: boolean } | null>({
    id: "p1",
    published: true,
  })
})
const mockExecuteRaw = mock((...args: unknown[]) => {
  void args
  return Promise.resolve(1)
})
mock.module("@/lib/prisma", () => ({
  prisma: { property: { findUnique: mockPropertyFindUnique }, $executeRaw: mockExecuteRaw },
}))

// next/server (NextResponse.json) is mocked globally in test-setup.ts.

const { POST } = await import("./route")

function makeRequest(body: unknown): NextRequest {
  return {
    json: () => (body === undefined ? Promise.reject(new Error("no body")) : Promise.resolve(body)),
  } as unknown as NextRequest
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) }
}

beforeEach(() => {
  mockPropertyFindUnique.mockImplementation(() => Promise.resolve({ id: "p1", published: true }))
  mockExecuteRaw.mockClear()
})

describe("POST /api/properties/[id]/event", () => {
  test("returns 400 for an unrecognized event type", async () => {
    const res = await POST(makeRequest({ type: "not_a_real_event" }), ctx("p1"))
    expect(res.status).toBe(400)
    expect(mockExecuteRaw).not.toHaveBeenCalled()
  })

  test("returns 400 when the body isn't valid JSON", async () => {
    const res = await POST(makeRequest(undefined), ctx("p1"))
    expect(res.status).toBe(400)
  })

  test("returns 404 for a property that doesn't exist", async () => {
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve(null))
    const res = await POST(makeRequest({ type: "whatsapp_click" }), ctx("missing"))
    expect(res.status).toBe(404)
    expect(mockExecuteRaw).not.toHaveBeenCalled()
  })

  test("returns 404 for an unpublished property (no metrics leak)", async () => {
    mockPropertyFindUnique.mockImplementation(() => Promise.resolve({ id: "p1", published: false }))
    const res = await POST(makeRequest({ type: "whatsapp_click" }), ctx("p1"))
    expect(res.status).toBe(404)
    expect(mockExecuteRaw).not.toHaveBeenCalled()
  })

  test("increments the right metrics path for a top-level event", async () => {
    const res = await POST(makeRequest({ type: "whatsapp_click" }), ctx("p1"))
    expect(res.status).toBe(200)
    const [, path] = mockExecuteRaw.mock.calls[0] as unknown as [unknown, string]
    expect(path).toBe("{whatsapp}")
  })

  test("increments the right metrics path for a nested social event", async () => {
    await POST(makeRequest({ type: "social_instagram_click" }), ctx("p1"))
    const [, path] = mockExecuteRaw.mock.calls[0] as unknown as [unknown, string]
    expect(path).toBe("{social,instagram}")
  })

  test("increments the right metrics path for a nested contact event", async () => {
    await POST(makeRequest({ type: "contact_whatsapp_click" }), ctx("p1"))
    const [, path] = mockExecuteRaw.mock.calls[0] as unknown as [unknown, string]
    expect(path).toBe("{contact,whatsapp}")
  })
})
