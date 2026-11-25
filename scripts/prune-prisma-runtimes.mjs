// Prisma ships a runtime per engine and database (each Wasm engine inlined as
// base64, ~57 MB together) and the build traces the whole folder into every
// function. The generated client only loads runtime/client.js plus its own
// query_compiler_bg.wasm. outputFileTracingExcludes can't drop them: Turbopack
// ignores it for the proxy trace. So they're moved aside for `next build` and
// put back afterwards: `prisma generate` copies its engine from this folder and
// Vercel caches node_modules after the build.
import { mkdirSync, readdirSync, renameSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

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

export function restorePrismaRuntimes(runtimeDir, stashDir) {
  return stashPrismaRuntimes(stashDir, runtimeDir)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const runtimeDir = "node_modules/@prisma/client/runtime"
  const stashDir = ".prisma-unused-runtimes"
  if (process.argv[2] === "--restore") {
    console.log(`Restored ${restorePrismaRuntimes(runtimeDir, stashDir)} Prisma runtimes`)
  } else {
    console.log(`Moved ${stashPrismaRuntimes(runtimeDir, stashDir)} unused Prisma runtimes aside`)
  }
}
