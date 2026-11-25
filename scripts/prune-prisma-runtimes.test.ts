import { describe, expect, test } from "bun:test"
import { mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import {
  isUnusedPrismaRuntime,
  removeStaleNativeEngines,
  restorePrismaRuntimes,
  stashPrismaRuntimes,
} from "./prune-prisma-runtimes.mjs"

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

describe("stashPrismaRuntimes / restorePrismaRuntimes", () => {
  test("moves only the unused runtimes aside and puts them back", () => {
    const root = mkdtempSync(join(tmpdir(), "prisma-runtime-"))
    const runtimeDir = join(root, "runtime")
    const stashDir = join(root, "stash")
    const files = ["client.js", "edge.js", "index-browser.js", "library.js"]
    mkdirSync(runtimeDir)
    for (const file of files) writeFileSync(join(runtimeDir, file), "")

    expect(stashPrismaRuntimes(runtimeDir, stashDir)).toBe(2)
    expect(readdirSync(runtimeDir).sort()).toEqual(["client.js", "index-browser.js"])
    expect(readdirSync(stashDir).sort()).toEqual(["edge.js", "library.js"])

    expect(restorePrismaRuntimes(runtimeDir, stashDir)).toBe(2)
    expect(readdirSync(runtimeDir).sort()).toEqual(files)
  })
})

describe("removeStaleNativeEngines", () => {
  test("deletes native engines left over in the generated client", () => {
    const dir = mkdtempSync(join(tmpdir(), "prisma-client-"))
    for (const file of ["index.js", "query_compiler_bg.wasm", "libquery_engine-rhel.so.node"]) {
      writeFileSync(join(dir, file), "")
    }

    expect(removeStaleNativeEngines(dir)).toBe(1)
    expect(readdirSync(dir).sort()).toEqual(["index.js", "query_compiler_bg.wasm"])
  })
})
