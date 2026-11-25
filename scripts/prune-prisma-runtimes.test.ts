import { describe, expect, test } from "bun:test"
import { mkdtempSync, readdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { isUnusedPrismaRuntime, prunePrismaRuntimes } from "./prune-prisma-runtimes.mjs"

describe("isUnusedPrismaRuntime", () => {
  test("flags the engines and runtimes the generated client never loads", () => {
    for (const file of [
      "query_engine_bg.postgresql.wasm-base64.js",
      "query_compiler_bg.sqlite.mjs",
      "binary.js",
      "library.mjs",
      "edge.js",
      "edge-esm.js",
      "react-native.js",
      "wasm-compiler-edge.js",
    ]) {
      expect(isUnusedPrismaRuntime(file)).toBe(true)
    }
  })

  test("keeps the runtime the generated client loads", () => {
    for (const file of ["client.js", "client.mjs", "client.d.mts", "index-browser.js"]) {
      expect(isUnusedPrismaRuntime(file)).toBe(false)
    }
  })
})

describe("prunePrismaRuntimes", () => {
  test("deletes only the unused runtimes", () => {
    const dir = mkdtempSync(join(tmpdir(), "prisma-runtime-"))
    for (const file of ["client.js", "index-browser.js", "library.js", "edge.js"]) {
      writeFileSync(join(dir, file), "")
    }

    expect(prunePrismaRuntimes(dir)).toBe(2)
    expect(readdirSync(dir).sort()).toEqual(["client.js", "index-browser.js"])
  })
})
