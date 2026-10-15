import { beforeEach, describe, expect, mock, test } from "bun:test"
import { setupIncrementalCache } from "@/lib/test-utils/incremental-cache"

const property = {
  id: "p1",
  slug: "casa-laureles",
  title: "Casa en Laureles",
  price: { toString: () => "650000000" },
  previousPrice: { toString: () => "700000000" } as { toString: () => string } | null,
  createdAt: new Date("2026-10-01T12:00:00Z"),
  updatedAt: new Date("2026-10-02T12:00:00Z"),
  pinnedAt: null as Date | null,
  user: { name: "Ana", email: "ana@example.com" },
}

type FindArgs = { where: unknown; include?: { user: { select: Record<string, boolean> } } }
const propertyFindUnique = mock((args: FindArgs) => {
  void args
  return Promise.resolve<typeof property | null>(property)
})
const userFindUnique = mock((args: { where: unknown; select: Record<string, boolean> }) => {
  void args
  return Promise.resolve({ id: "u1", name: "Ana", profilePublished: true })
})

mock.module("@/lib/prisma", () => ({
  prisma: {
    property: { findUnique: propertyFindUnique },
    user: { findUnique: userFindUnique },
  },
}))

const { getPublicProperty, getPublicAgent } = await import("./public-pages")

setupIncrementalCache()

beforeEach(() => {
  propertyFindUnique.mockClear()
  propertyFindUnique.mockImplementation(() => Promise.resolve(property))
  userFindUnique.mockClear()
})

describe("getPublicProperty", () => {
  test("serializes prices and dates so the cached value survives JSON", async () => {
    const result = await getPublicProperty("casa-laureles")
    expect(result).toMatchObject({
      price: 650000000,
      previousPrice: 700000000,
      createdAt: "2026-10-01T12:00:00.000Z",
      updatedAt: "2026-10-02T12:00:00.000Z",
      pinnedAt: null,
    })
    expect(propertyFindUnique.mock.calls[0][0].where).toEqual({ slug: "casa-laureles" })
  })

  test("keeps a missing previous price as null instead of 0", async () => {
    propertyFindUnique.mockImplementation(() =>
      Promise.resolve({ ...property, previousPrice: null, pinnedAt: new Date("2026-10-03T00:00:00Z") })
    )
    const result = await getPublicProperty("casa-laureles")
    expect(result?.previousPrice).toBeNull()
    expect(result?.pinnedAt).toBe("2026-10-03T00:00:00.000Z")
  })

  test("returns null for an unknown slug", async () => {
    propertyFindUnique.mockImplementation(() => Promise.resolve(null))
    expect(await getPublicProperty("no-existe")).toBeNull()
  })

  test("never selects the agent's id for the public view", async () => {
    await getPublicProperty("casa-laureles")
    const userSelect = propertyFindUnique.mock.calls[0][0].include?.user.select ?? {}
    expect(userSelect.id).toBeUndefined()
    expect(userSelect.name).toBe(true)
  })
})

describe("getPublicAgent", () => {
  test("looks the agent up by public slug and exposes whether the profile is published", async () => {
    const agent = await getPublicAgent("ana-gomez")
    expect(agent).toMatchObject({ name: "Ana", profilePublished: true })
    expect(userFindUnique.mock.calls[0][0].where).toEqual({ agentSlug: "ana-gomez" })
    expect(userFindUnique.mock.calls[0][0].select.profilePublished).toBe(true)
  })
})
