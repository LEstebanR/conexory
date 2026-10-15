import { describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { Glob } from "bun"

// Bun's coverage report only lists files some test imports, so a module with
// no test at all is invisible to the 80% threshold. This guard makes every
// server-side module either have its own test or be listed here with a reason.
const UNTESTED_ALLOWLIST: Record<string, string> = {
  "lib/auth.ts": "better-auth config; every action test replaces it via mock.module, which is process-wide",
  "lib/auth-client.ts": "browser-only better-auth client with no logic of its own",
  "lib/prisma.ts": "PrismaClient singleton; the retry logic lives in prisma-retry.ts",
  "lib/brand.ts": "static constants",
  "lib/colombia.ts": "static list of departments and cities",
  "lib/faq-data.ts": "static FAQ copy",
  "lib/property-types.ts": "static labels, exercised by city-seo and properties tests",
  "lib/share-message-options.ts": "static options, exercised by share-message tests",
  "lib/flyer-options.ts": "static options, exercised by the flyer route test",
  "lib/public-cache.ts": "exercised end to end by featured-properties, properties and public-pages tests",
  "lib/orphan-subscriptions.ts": "exercised by the billing cron and Mercado Pago webhook route tests",
  "lib/flyer/index.tsx": "image rendering; mocked by the flyer route test, checked visually",
  "lib/flyer/shared.tsx": "image rendering; mocked by the flyer route test, checked visually",
  "lib/flyer/clasica.tsx": "image rendering template",
  "lib/flyer/extra.tsx": "image rendering template",
  "lib/flyer/ficha.tsx": "image rendering template",
  "lib/flyer/fotos.tsx": "image rendering template",
  "lib/flyer/sin-fotos.tsx": "image rendering template",
  "app/api/auth/[...all]/route.ts": "one-line better-auth handler re-export",
  "app/p/[slug]/og.jpg/route.tsx": "OG image rendering, checked with a link preview",
}

const SOURCE_GLOBS = ["lib/**/*.{ts,tsx}", "app/**/actions.ts", "app/**/route.{ts,tsx}"]

function isTestOrHelper(path: string) {
  return /\.test\.tsx?$/.test(path) || path.startsWith("lib/test-utils/")
}

function hasSiblingTest(path: string) {
  const base = path.replace(/\.tsx?$/, "")
  return existsSync(`${base}.test.ts`) || existsSync(`${base}.test.tsx`)
}

const sources = SOURCE_GLOBS.flatMap((pattern) => [...new Glob(pattern).scanSync(".")])
  .map((path) => path.replaceAll("\\", "/"))
  .filter((path) => !isTestOrHelper(path))

describe("test coverage guard", () => {
  test("every server-side module has a test or a documented reason not to", () => {
    const missing = sources.filter((path) => !hasSiblingTest(path) && !(path in UNTESTED_ALLOWLIST))
    expect(missing).toEqual([])
  })

  test("the allowlist has no stale entries", () => {
    const stale = Object.keys(UNTESTED_ALLOWLIST).filter((path) => !existsSync(path) || hasSiblingTest(path))
    expect(stale).toEqual([])
  })
})
