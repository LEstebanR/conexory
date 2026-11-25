// Prisma ships a runtime per engine and database (each Wasm engine inlined as
// base64, ~57 MB together), and the build traces the whole folder into every
// function. The generated client only loads runtime/client.js plus its own
// query_compiler_bg.wasm, so the rest is dead weight.
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const PRISMA_RUNTIME_DIR = "node_modules/@prisma/client/runtime/"
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

export const UNUSED_PRISMA_RUNTIME_GLOBS = UNUSED_RUNTIME_PREFIXES.map(
  (prefix) => `${PRISMA_RUNTIME_DIR}${prefix}*`,
)

export function isUnusedPrismaRuntime(tracedPath) {
  const at = tracedPath.lastIndexOf(PRISMA_RUNTIME_DIR)
  if (at === -1) return false
  const file = tracedPath.slice(at + PRISMA_RUNTIME_DIR.length)
  return !file.includes("/") && UNUSED_RUNTIME_PREFIXES.some((prefix) => file.startsWith(prefix))
}

// Turbopack ignores outputFileTracingExcludes for the proxy (middleware) trace,
// so it's pruned here after `next build`.
export function pruneTrace(traceFile) {
  const trace = JSON.parse(readFileSync(traceFile, "utf8"))
  const kept = trace.files.filter((file) => !isUnusedPrismaRuntime(file))
  writeFileSync(traceFile, JSON.stringify({ ...trace, files: kept }))
  return trace.files.length - kept.length
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const traceFile = ".next/server/middleware.js.nft.json"
  console.log(`Pruned ${pruneTrace(traceFile)} unused Prisma runtime files from ${traceFile}`)
}
