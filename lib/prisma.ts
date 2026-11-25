import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { prismaAdapterKind } from "@/lib/prisma-adapter"
import { withConnectionRetry } from "@/lib/prisma-retry"

function createAdapter(connectionString = process.env.DATABASE_URL ?? "") {
  const kind = prismaAdapterKind(connectionString, process.env.VERCEL_ENV)
  console.info(`[prisma] using the ${kind} driver adapter`)
  return kind === "neon" ? new PrismaNeon({ connectionString }) : new PrismaPg({ connectionString })
}

function createPrismaClient() {
  const client = new PrismaClient({
    adapter: createAdapter(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

  // Neon's pooler occasionally drops a cold connection under scale-up — retry a
  // couple times with a short backoff instead of surfacing a 500 for what's
  // usually a few hundred ms blip.
  return client.$extends({
    query: {
      $allOperations: ({ args, query }) => withConnectionRetry(() => query(args)),
    },
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
