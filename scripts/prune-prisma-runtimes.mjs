// Prisma ships a runtime per engine and database (each Wasm engine inlined as
// base64, ~57 MB together) and the build traces the whole folder into every
// function. The generated client only loads runtime/client.js plus its own
// query_compiler_bg.wasm. outputFileTracingExcludes can't drop them: Turbopack
// ignores it for the proxy trace, so they're deleted before `next build`.
import { readdirSync, rmSync } from "node:fs"
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

export function prunePrismaRuntimes(runtimeDir) {
  const unused = readdirSync(runtimeDir).filter(isUnusedPrismaRuntime)
  for (const file of unused) rmSync(join(runtimeDir, file))
  return unused.length
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const runtimeDir = "node_modules/@prisma/client/runtime"
  console.log(`Removed ${prunePrismaRuntimes(runtimeDir)} unused Prisma runtimes from ${runtimeDir}`)
}
