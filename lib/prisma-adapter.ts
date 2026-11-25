export type PrismaAdapterKind = "neon" | "pg"

const NEON_HOST = /@[^/]+\.neon\.tech(:\d+)?\//

// Neon's driver only speaks WebSocket to Neon's proxy, so a plain Postgres (the
// E2E service container in CI) goes through node-postgres instead. Production
// is always Neon, so it never depends on how the URL looks.
export function prismaAdapterKind(
  connectionString: string,
  vercelEnv: string | undefined,
): PrismaAdapterKind {
  if (vercelEnv === "production") return "neon"
  return NEON_HOST.test(connectionString) ? "neon" : "pg"
}
