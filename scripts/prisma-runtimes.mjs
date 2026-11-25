// Prisma ships a runtime per engine and database (each Wasm engine inlined as
// base64, ~57 MB together) and the build traces the whole folder into every
// function. The generated client only loads runtime/client.js plus its own
// query_compiler_bg.wasm. outputFileTracingExcludes can't drop them: Turbopack
// ignores it for the proxy trace. So they're moved aside for `next build` and
// put back afterwards: `prisma generate` copies its engine from this folder and
// Vercel caches node_modules after the build.
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs"
import { join } from "node:path"

const UNUSED_RUNTIME_PREFIXES = [
  "query_engine_bg.",
  "query_compiler_bg.",
  "binary.",
  "library.",
  "edge.",
  "edge-esm.",
  "react-native.",
  "wasm-",
]

export function isUnusedPrismaRuntime(fileName) {
  return UNUSED_RUNTIME_PREFIXES.some((prefix) => fileName.startsWith(prefix))
}

export function stashPrismaRuntimes(runtimeDir, stashDir) {
  mkdirSync(stashDir, { recursive: true })
  const unused = readdirSync(runtimeDir).filter(isUnusedPrismaRuntime)
  for (const file of unused) renameSync(join(runtimeDir, file), join(stashDir, file))
  return unused.length
}

// `prisma generate` doesn't clean its output folder, so a build cache from the
// native-engine days still carries libquery_engine-*.node, and the whole
// folder gets traced. Nothing loads it with engineType = "client".
export function removeStaleNativeEngines(clientDir) {
  const stale = readdirSync(clientDir).filter((file) => file.endsWith(".node"))
  for (const file of stale) rmSync(join(clientDir, file))
  return stale.length
}

export function restorePrismaRuntimes(runtimeDir, stashDir) {
  return stashPrismaRuntimes(stashDir, runtimeDir)
}
