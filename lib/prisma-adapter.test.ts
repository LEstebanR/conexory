import { describe, expect, test } from "bun:test"
import { prismaAdapterKind } from "./prisma-adapter"

const NEON_URL =
  "postgresql://user:pass@ep-proud-unit-aqpl2g8k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
const LOCAL_URL = "postgresql://postgres:postgres@localhost:5432/conexory_e2e"

describe("prismaAdapterKind", () => {
  test("always uses Neon in production, whatever the URL looks like", () => {
    expect(prismaAdapterKind(NEON_URL, "production")).toBe("neon")
    expect(prismaAdapterKind(LOCAL_URL, "production")).toBe("neon")
    expect(prismaAdapterKind("", "production")).toBe("neon")
  })

  test("uses Neon for a Neon host outside production", () => {
    expect(prismaAdapterKind(NEON_URL, "preview")).toBe("neon")
    expect(prismaAdapterKind(NEON_URL, undefined)).toBe("neon")
  })

  test("uses node-postgres for any other Postgres", () => {
    expect(prismaAdapterKind(LOCAL_URL, undefined)).toBe("pg")
    expect(prismaAdapterKind("", undefined)).toBe("pg")
  })
})
