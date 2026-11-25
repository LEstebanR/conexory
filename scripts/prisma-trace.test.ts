import { describe, expect, test } from "bun:test"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { isUnusedPrismaRuntime, pruneTrace } from "./prisma-trace.mjs"

const RUNTIME = "../../node_modules/@prisma/client/runtime"

describe("isUnusedPrismaRuntime", () => {
  test("flags the engines and runtimes the generated client never loads", () => {
    expect(isUnusedPrismaRuntime(`${RUNTIME}/query_engine_bg.postgresql.wasm-base64.js`)).toBe(true)
    expect(isUnusedPrismaRuntime(`${RUNTIME}/query_compiler_bg.sqlite.mjs`)).toBe(true)
    expect(isUnusedPrismaRuntime(`${RUNTIME}/library.js`)).toBe(true)
    expect(isUnusedPrismaRuntime(`${RUNTIME}/edge-esm.js`)).toBe(true)
    expect(isUnusedPrismaRuntime(`${RUNTIME}/wasm-compiler-edge.js`)).toBe(true)
  })

  test("keeps the client runtime and the generated client's own engine", () => {
    expect(isUnusedPrismaRuntime(`${RUNTIME}/client.js`)).toBe(false)
    expect(isUnusedPrismaRuntime(`${RUNTIME}/index-browser.js`)).toBe(false)
    expect(isUnusedPrismaRuntime("../../node_modules/.prisma/client/query_compiler_bg.wasm")).toBe(
      false,
    )
    expect(isUnusedPrismaRuntime("../../node_modules/next/dist/server/library.js")).toBe(false)
  })
})

describe("pruneTrace", () => {
  test("drops unused runtimes from a trace file and keeps everything else", () => {
    const traceFile = join(mkdtempSync(join(tmpdir(), "trace-")), "middleware.js.nft.json")
    const kept = [`${RUNTIME}/client.js`, "../../node_modules/next/package.json", "proxy.js"]
    writeFileSync(
      traceFile,
      JSON.stringify({ version: 1, files: [...kept, `${RUNTIME}/library.js`, `${RUNTIME}/edge.js`] }),
    )

    expect(pruneTrace(traceFile)).toBe(2)
    expect(JSON.parse(readFileSync(traceFile, "utf8"))).toEqual({ version: 1, files: kept })
  })
})
