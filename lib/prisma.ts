import { PrismaClient, Prisma } from "@prisma/client"

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

  // Neon's pooler occasionally drops a cold connection under scale-up
  // (Prisma error P1001, "Can't reach database server") — retry a couple
  // times with a short backoff instead of surfacing a 500 for what's usually
  // a few hundred ms blip.
  return client.$extends({
    query: {
      $allOperations: async ({ args, query }) => {
        for (let attempt = 0; ; attempt++) {
          try {
            return await query(args)
          } catch (error) {
            const isRetryableConnectionError =
              error instanceof Prisma.PrismaClientInitializationError &&
              error.errorCode === "P1001"
            if (!isRetryableConnectionError || attempt >= 2) throw error
            await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)))
          }
        }
      },
    },
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
