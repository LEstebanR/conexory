import { describe, test, expect, mock } from "bun:test"

const mockGetSession = mock(() =>
  Promise.resolve<{ user: { id: string } } | null>({ user: { id: "user-1" } })
)

mock.module("@/lib/auth", () => ({
  auth: { api: { getSession: mockGetSession } },
}))

mock.module("next/headers", () => ({
  headers: () => Promise.resolve(new Headers()),
}))

const mockToBuffer = mock(() => Promise.resolve(Buffer.from("fake-jpeg")))
mock.module("sharp", () => ({
  default: () => ({
    rotate: () => ({
      resize: () => ({
        jpeg: () => ({ toBuffer: mockToBuffer }),
      }),
    }),
  }),
}))

const mockPut = mock(
  (_pathname: string, _body: Buffer, _options?: { access: string; contentType: string }) =>
    Promise.resolve({ url: "https://blob.example.com/img.jpg" })
)
mock.module("@vercel/blob", () => ({ put: mockPut }))

mock.module("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(data), {
        status: init?.status ?? 200,
        headers: { "content-type": "application/json" },
      }),
  },
}))

const { POST } = await import("./route")

function makeRequest(file?: { name: string; type: string; size: number; arrayBuffer(): Promise<ArrayBuffer> } | null): Request {
  const formData: FormData = {
    get: (key: string) => (key === "file" && file !== undefined ? file : null),
  } as unknown as FormData
  return { formData: () => Promise.resolve(formData) } as unknown as Request
}

const validFile = {
  name: "photo.jpg",
  type: "image/jpeg",
  size: 1024,
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)),
}

describe("POST /api/upload", () => {
  test("returns 401 when unauthenticated", async () => {
    mockGetSession.mockImplementation(() => Promise.resolve(null))
    const res = await POST(makeRequest(validFile))
    expect(res.status).toBe(401)
    mockGetSession.mockImplementation(() => Promise.resolve({ user: { id: "user-1" } }))
  })

  test("returns 400 when no file is provided", async () => {
    const res = await POST(makeRequest(null))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  test("returns 400 for non-image MIME type", async () => {
    const pdf = { ...validFile, type: "application/pdf" }
    const res = await POST(makeRequest(pdf))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })

  test("returns 400 when file exceeds 20 MB", async () => {
    const bigFile = { ...validFile, size: 21 * 1024 * 1024 }
    const res = await POST(makeRequest(bigFile))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/20/)
  })

  test("returns 200 with blob url for a valid image", async () => {
    const res = await POST(makeRequest(validFile))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe("https://blob.example.com/img.jpg")
  })

  test("calls put with public access and jpeg content type", async () => {
    mockPut.mockClear()
    await POST(makeRequest(validFile))
    expect(mockPut).toHaveBeenCalledTimes(1)
    const [, , options] = mockPut.mock.calls[0]
    expect(options).toMatchObject({ access: "public", contentType: "image/jpeg" })
  })
})
