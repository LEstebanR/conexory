import { describe, test, expect, mock } from "bun:test"
import type { PrismaClient } from "@prisma/client"
import { generateAgentSlug, ensureAgentSlug } from "./agent-slug"

function fakePrisma(opts: {
  taken?: string[]
  findUniqueForEnsure?: { agentSlug: string | null } | null
} = {}): PrismaClient {
  const taken = new Set(opts.taken ?? [])
  const findUnique = mock((args: { where: { agentSlug?: string; id?: string } }) => {
    if (args.where.id) return Promise.resolve(opts.findUniqueForEnsure ?? null)
    return Promise.resolve(taken.has(args.where.agentSlug ?? "") ? { id: "existing" } : null)
  })
  const update = mock((...args: [unknown]) => {
    void args
    return Promise.resolve({})
  })
  return { user: { findUnique, update } } as unknown as PrismaClient
}

describe("generateAgentSlug", () => {
  test("slugifies a simple name", async () => {
    const slug = await generateAgentSlug("Luis Ramirez", fakePrisma())
    expect(slug).toBe("luis-ramirez")
  })

  test("strips accents", async () => {
    const slug = await generateAgentSlug("José Peña", fakePrisma())
    expect(slug).toBe("jose-pena")
  })

  test("strips punctuation and collapses whitespace/hyphens", async () => {
    const slug = await generateAgentSlug("  María   José--Gómez! ", fakePrisma())
    expect(slug).toBe("maria-jose-gomez")
  })

  test("appends -2 when the base slug is taken", async () => {
    const prisma = fakePrisma({ taken: ["luis-ramirez"] })
    const slug = await generateAgentSlug("Luis Ramirez", prisma)
    expect(slug).toBe("luis-ramirez-2")
  })

  test("keeps incrementing past multiple collisions", async () => {
    const prisma = fakePrisma({ taken: ["luis-ramirez", "luis-ramirez-2", "luis-ramirez-3"] })
    const slug = await generateAgentSlug("Luis Ramirez", prisma)
    expect(slug).toBe("luis-ramirez-4")
  })
})

describe("ensureAgentSlug", () => {
  test("returns the existing slug without generating a new one", async () => {
    const prisma = fakePrisma({ findUniqueForEnsure: { agentSlug: "already-set" } })
    const slug = await ensureAgentSlug("u1", "Luis Ramirez", prisma)
    expect(slug).toBe("already-set")
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  test("generates and persists a slug when the user doesn't have one", async () => {
    const prisma = fakePrisma({ findUniqueForEnsure: { agentSlug: null } })
    const slug = await ensureAgentSlug("u1", "Luis Ramirez", prisma)
    expect(slug).toBe("luis-ramirez")
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { agentSlug: "luis-ramirez" },
    })
  })
})
