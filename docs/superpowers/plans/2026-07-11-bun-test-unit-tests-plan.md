# Configurar bun:test y agregar la primera tanda de pruebas unitarias — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up `bun:test` as the project's test runner and add the first batch of unit tests, covering the pure functions in `lib/`, plus a CI job that runs them on every PR.

**Architecture:** Bun's built-in test runner (Jest-compatible API, zero new dependencies) with tests colocated next to the source file they cover (`lib/utils.test.ts` beside `lib/utils.ts`). No mocks in this batch — every function under test is pure (no network, session, or database access).

**Tech Stack:** `bun:test` (built into the Bun runtime already used by this project), TypeScript, Zod (for the schema test).

## Global Constraints

- No new dependencies — do not run `bun add`. `bun:test` ships with Bun.
- Test files use the `*.test.ts` suffix and live next to the file they test (per spec: `docs/superpowers/specs/2026-07-11-bun-test-unit-tests-design.md`).
- Do not touch any production code in this plan — the only non-test changes are `package.json` (add the `test` script) and `.github/workflows/ci.yml` (add the `test` job).
- Do not add `bunfig.toml` or any coverage configuration — that's out of scope (tracked in LES-237).
- Do not write tests for `app/api/upload/route.ts` or any Server Action — those require mocks and are tracked separately in LES-236.

---

### Task 1: `test` script + `lib/utils.test.ts`

**Files:**
- Modify: `package.json` (add `test` script)
- Create: `lib/utils.test.ts`

**Interfaces:**
- Consumes: `cn` from `lib/utils.ts` (`export function cn(...inputs: ClassValue[]): string`)
- Produces: the `bun test` npm script, used by every later task and by the CI job in Task 8

- [ ] **Step 1: Add the `test` script to `package.json`**

Edit `package.json`, adding `"test": "bun test"` right after `"lint": "eslint"`:

```json
  "scripts": {
    "dev": "prisma generate && next dev",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "eslint",
    "test": "bun test",
    "postinstall": "prisma generate",
    "prepare": "git config core.hooksPath .githooks"
  },
```

- [ ] **Step 2: Write `lib/utils.test.ts`**

```ts
import { describe, test, expect } from "bun:test"
import { cn } from "./utils"

describe("cn", () => {
  test("combines multiple class strings", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center")
  })

  test("resolves Tailwind conflicts, keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })

  test("drops falsy values", () => {
    expect(cn("flex", undefined, false, null, "gap-2")).toBe("flex gap-2")
  })

  test("returns an empty string with no arguments", () => {
    expect(cn()).toBe("")
  })
})
```

- [ ] **Step 3: Run the test**

Run: `bun test lib/utils.test.ts`
Expected: `4 pass` (all four `cn` tests pass — the implementation already exists, this is a coverage-only addition, not TDD-new-code)

- [ ] **Step 4: Commit**

```bash
git add package.json lib/utils.test.ts
git commit -m "test(LES-159): add bun:test runner and cn() tests"
```

---

### Task 2: `lib/urls.test.ts`

**Files:**
- Create: `lib/urls.test.ts`

**Interfaces:**
- Consumes: `getAppUrl` from `lib/urls.ts` (`export function getAppUrl(): string`, reads `process.env.APP_URL`, `process.env.VERCEL_PROJECT_PRODUCTION_URL`, `process.env.VERCEL_URL` at call time)

- [ ] **Step 1: Write `lib/urls.test.ts`**

```ts
import { describe, test, expect, beforeEach, afterEach } from "bun:test"
import { getAppUrl } from "./urls"

const ENV_KEYS = ["APP_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"] as const
const originalEnv: Record<string, string | undefined> = {}

beforeEach(() => {
  for (const key of ENV_KEYS) {
    originalEnv[key] = process.env[key]
    delete process.env[key]
  }
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key]
    else process.env[key] = originalEnv[key]
  }
})

describe("getAppUrl", () => {
  test("falls back to localhost when nothing is set", () => {
    expect(getAppUrl()).toBe("http://localhost:3000")
  })

  test("prefers VERCEL_URL over the localhost fallback", () => {
    process.env.VERCEL_URL = "conexory-preview.vercel.app"
    expect(getAppUrl()).toBe("https://conexory-preview.vercel.app")
  })

  test("prefers VERCEL_PROJECT_PRODUCTION_URL over VERCEL_URL", () => {
    process.env.VERCEL_URL = "conexory-preview.vercel.app"
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "conexory.com"
    expect(getAppUrl()).toBe("https://conexory.com")
  })

  test("prefers APP_URL over everything else", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "conexory.com"
    process.env.APP_URL = "https://custom-domain.com"
    expect(getAppUrl()).toBe("https://custom-domain.com")
  })

  test("treats an empty string as absent", () => {
    process.env.APP_URL = ""
    process.env.VERCEL_PROJECT_PRODUCTION_URL = ""
    process.env.VERCEL_URL = "conexory-preview.vercel.app"
    expect(getAppUrl()).toBe("https://conexory-preview.vercel.app")
  })
})
```

- [ ] **Step 2: Run the test**

Run: `bun test lib/urls.test.ts`
Expected: `5 pass`

- [ ] **Step 3: Commit**

```bash
git add lib/urls.test.ts
git commit -m "test(LES-159): add getAppUrl() tests"
```

---

### Task 3: `lib/format.test.ts`

**Files:**
- Create: `lib/format.test.ts`

**Interfaces:**
- Consumes: `formatCOP`, `formatCOPMillionsValue`, `formatCOPMillions` from `lib/format.ts` (all `(amount: number) => string`)

- [ ] **Step 1: Write `lib/format.test.ts`**

```ts
import { describe, test, expect } from "bun:test"
import { formatCOP, formatCOPMillionsValue, formatCOPMillions } from "./format"

describe("formatCOP", () => {
  test("formats a whole number as Colombian pesos, no decimals", () => {
    expect(formatCOP(1500000)).toBe("$ 1.500.000")
  })

  test("formats zero", () => {
    expect(formatCOP(0)).toBe("$ 0")
  })
})

describe("formatCOPMillionsValue", () => {
  test("rounds to the nearest million with no suffix", () => {
    expect(formatCOPMillionsValue(451_400_000)).toBe("$451")
  })

  test("rounds up at the midpoint", () => {
    expect(formatCOPMillionsValue(1_500_000)).toBe("$2")
  })
})

describe("formatCOPMillions", () => {
  test("appends the M suffix", () => {
    expect(formatCOPMillions(451_400_000)).toBe("$451 M")
  })
})
```

- [ ] **Step 2: Run the test**

Run: `bun test lib/format.test.ts`
Expected: `5 pass`

- [ ] **Step 3: Commit**

```bash
git add lib/format.test.ts
git commit -m "test(LES-159): add COP formatting tests"
```

---

### Task 4: `lib/youtube.test.ts`

**Files:**
- Create: `lib/youtube.test.ts`

**Interfaces:**
- Consumes: `youtubeId`, `isYoutubeUrl`, `youtubeEmbedUrl`, `youtubeThumb` from `lib/youtube.ts`

- [ ] **Step 1: Write `lib/youtube.test.ts`**

```ts
import { describe, test, expect } from "bun:test"
import { youtubeId, isYoutubeUrl, youtubeEmbedUrl, youtubeThumb } from "./youtube"

const VIDEO_ID = "dQw4w9WgXcQ"

describe("youtubeId", () => {
  test("extracts the id from a watch URL", () => {
    expect(youtubeId(`https://www.youtube.com/watch?v=${VIDEO_ID}`)).toBe(VIDEO_ID)
  })

  test("extracts the id from a youtu.be short URL", () => {
    expect(youtubeId(`https://youtu.be/${VIDEO_ID}`)).toBe(VIDEO_ID)
  })

  test("extracts the id from an embed URL", () => {
    expect(youtubeId(`https://www.youtube.com/embed/${VIDEO_ID}`)).toBe(VIDEO_ID)
  })

  test("extracts the id from a shorts URL", () => {
    expect(youtubeId(`https://www.youtube.com/shorts/${VIDEO_ID}`)).toBe(VIDEO_ID)
  })

  test("extracts the id from a live URL", () => {
    expect(youtubeId(`https://www.youtube.com/live/${VIDEO_ID}`)).toBe(VIDEO_ID)
  })

  test("trims surrounding whitespace", () => {
    expect(youtubeId(`  https://youtu.be/${VIDEO_ID}  `)).toBe(VIDEO_ID)
  })

  test("returns null for a non-YouTube URL", () => {
    expect(youtubeId("https://example.com/not-a-video")).toBeNull()
  })

  test("returns null for empty or nullish input", () => {
    expect(youtubeId("")).toBeNull()
    expect(youtubeId(null)).toBeNull()
    expect(youtubeId(undefined)).toBeNull()
  })
})

describe("isYoutubeUrl", () => {
  test("true for a valid YouTube URL", () => {
    expect(isYoutubeUrl(`https://youtu.be/${VIDEO_ID}`)).toBe(true)
  })

  test("false for a non-YouTube URL", () => {
    expect(isYoutubeUrl("https://vimeo.com/123")).toBe(false)
  })
})

describe("youtubeEmbedUrl", () => {
  test("builds the embed URL with the expected params", () => {
    expect(youtubeEmbedUrl(VIDEO_ID)).toBe(
      `https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`
    )
  })
})

describe("youtubeThumb", () => {
  test("builds the thumbnail URL", () => {
    expect(youtubeThumb(VIDEO_ID)).toBe(`https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`)
  })
})
```

- [ ] **Step 2: Run the test**

Run: `bun test lib/youtube.test.ts`
Expected: `12 pass`

- [ ] **Step 3: Commit**

```bash
git add lib/youtube.test.ts
git commit -m "test(LES-159): add YouTube URL parsing tests"
```

---

### Task 5: `lib/plans.test.ts`

**Files:**
- Create: `lib/plans.test.ts`

**Interfaces:**
- Consumes: `propertyLimit`, `photoLimit`, `FREE_PROPERTY_LIMIT`, `PRO_PROPERTY_LIMIT`, `FREE_PHOTO_LIMIT`, `PRO_PHOTO_LIMIT` from `lib/plans.ts`

- [ ] **Step 1: Write `lib/plans.test.ts`**

```ts
import { describe, test, expect } from "bun:test"
import {
  propertyLimit,
  photoLimit,
  FREE_PROPERTY_LIMIT,
  PRO_PROPERTY_LIMIT,
  FREE_PHOTO_LIMIT,
  PRO_PHOTO_LIMIT,
} from "./plans"

describe("propertyLimit", () => {
  test("returns the free limit for non-premium users", () => {
    expect(propertyLimit(false)).toBe(FREE_PROPERTY_LIMIT)
  })

  test("returns the pro limit for premium users", () => {
    expect(propertyLimit(true)).toBe(PRO_PROPERTY_LIMIT)
  })
})

describe("photoLimit", () => {
  test("returns the free limit for non-premium users", () => {
    expect(photoLimit(false)).toBe(FREE_PHOTO_LIMIT)
  })

  test("returns the pro limit for premium users", () => {
    expect(photoLimit(true)).toBe(PRO_PHOTO_LIMIT)
  })
})
```

- [ ] **Step 2: Run the test**

Run: `bun test lib/plans.test.ts`
Expected: `4 pass`

- [ ] **Step 3: Commit**

```bash
git add lib/plans.test.ts
git commit -m "test(LES-159): add plan limit tests"
```

---

### Task 6: `lib/blog.test.ts`

**Files:**
- Create: `lib/blog.test.ts`

**Interfaces:**
- Consumes: `getAllPosts`, `getRelatedPosts` from `lib/blog.ts`. Reads real files from `content/blog/*.md` — no mocks. Assertions are structural (shape, sort order, exclusion) rather than pinned to specific post content, so the test doesn't break when blog posts are added or removed.

- [ ] **Step 1: Write `lib/blog.test.ts`**

```ts
import { describe, test, expect } from "bun:test"
import { getAllPosts, getRelatedPosts } from "./blog"

describe("getAllPosts", () => {
  test("returns posts with the expected shape", () => {
    const posts = getAllPosts()
    expect(posts.length).toBeGreaterThan(0)
    for (const post of posts) {
      expect(typeof post.slug).toBe("string")
      expect(typeof post.title).toBe("string")
      expect(typeof post.date).toBe("string")
      expect(typeof post.description).toBe("string")
      expect(Array.isArray(post.tags)).toBe(true)
      expect(post.readingTime).toBeGreaterThanOrEqual(1)
    }
  })

  test("sorts posts by date, most recent first", () => {
    const dates = getAllPosts().map((p) => p.date)
    const sortedDescending = [...dates].sort((a, b) => (a < b ? 1 : -1))
    expect(dates).toEqual(sortedDescending)
  })
})

describe("getRelatedPosts", () => {
  test("excludes the given slug and respects the limit", () => {
    const [first] = getAllPosts()
    const related = getRelatedPosts(first.slug, 2)
    expect(related.length).toBeLessThanOrEqual(2)
    expect(related.some((p) => p.slug === first.slug)).toBe(false)
  })

  test("returns an empty array for a slug that doesn't exist", () => {
    expect(getRelatedPosts("this-slug-does-not-exist")).toEqual([])
  })
})
```

- [ ] **Step 2: Run the test**

Run: `bun test lib/blog.test.ts`
Expected: `4 pass`

- [ ] **Step 3: Commit**

```bash
git add lib/blog.test.ts
git commit -m "test(LES-159): add blog post listing/ranking tests"
```

---

### Task 7: `lib/validations/property.test.ts`

**Files:**
- Create: `lib/validations/property.test.ts`

**Interfaces:**
- Consumes: `PropertySchema` from `lib/validations/property.ts` (`z.ZodObject`, `.safeParse(data)` returns `{ success: true, data } | { success: false, error }`)

- [ ] **Step 1: Write `lib/validations/property.test.ts`**

```ts
import { describe, test, expect } from "bun:test"
import { PropertySchema } from "./property"

const validInput = {
  title: "Apartamento en Laureles",
  type: "apartment",
  transactionType: "sale",
  price: "350000000",
  state: "Antioquia",
  city: "Medellín",
  neighborhood: "Laureles",
  area: "65",
  landArea: "",
  bedrooms: "2",
  bathrooms: "2",
  parking: "1",
  description: "Bonito apartamento",
  images: ["https://example.com/a.jpg"],
  videoUrl: "",
  showContact: false,
  gatedCommunity: false,
}

describe("PropertySchema", () => {
  test("accepts a fully valid input", () => {
    const result = PropertySchema.safeParse(validInput)
    expect(result.success).toBe(true)
  })

  test("rejects an empty title", () => {
    const result = PropertySchema.safeParse({ ...validInput, title: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Escríbele un título a tu propiedad (mínimo 3 caracteres)."
      )
    }
  })

  test("rejects a negative price", () => {
    const result = PropertySchema.safeParse({ ...validInput, price: "-100" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Escribe el precio solo con números, sin puntos ni símbolos."
      )
    }
  })

  test("rejects an invalid property type", () => {
    const result = PropertySchema.safeParse({ ...validInput, type: "spaceship" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Elige el tipo de propiedad.")
    }
  })

  test("rejects more photos than the Pro plan allows", () => {
    const images = Array.from({ length: 21 }, (_, i) => `https://example.com/${i}.jpg`)
    const result = PropertySchema.safeParse({ ...validInput, images })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Puedes subir máximo 20 fotos por propiedad.")
    }
  })

  test("rejects a video URL that isn't from YouTube", () => {
    const result = PropertySchema.safeParse({ ...validInput, videoUrl: "https://vimeo.com/123" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Ese enlace no parece de YouTube. Revisa que sea el link de un video."
      )
    }
  })

  test("coerces empty optional numeric fields to null", () => {
    const result = PropertySchema.safeParse({ ...validInput, bedrooms: "", area: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.bedrooms).toBeNull()
      expect(result.data.area).toBeNull()
    }
  })
})
```

- [ ] **Step 2: Run the test**

Run: `bun test lib/validations/property.test.ts`
Expected: `7 pass`

- [ ] **Step 3: Commit**

```bash
git add lib/validations/property.test.ts
git commit -m "test(LES-159): add PropertySchema validation tests"
```

---

### Task 8: CI job

**Files:**
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: the `test` npm script added in Task 1 (`bun test`)

- [ ] **Step 1: Add the `test` job to `.github/workflows/ci.yml`**

Append this job after the existing `lint` job (keep `typecheck` and `lint` unchanged):

```yaml
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun test
```

The full file after this change:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  typecheck:
    name: Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bunx prisma generate
      - run: bun typecheck

  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun lint

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun test
```

- [ ] **Step 2: Run the full suite locally to confirm the CI job would pass**

Run: `bun test`
Expected: all test files from Tasks 1–7 pass (`41 pass` total: 4 + 5 + 5 + 12 + 4 + 4 + 7, no failures)

Run: `bun typecheck`
Expected: no errors

Run: `bun lint`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci(LES-159): run bun test on every PR"
```

---

## After this plan

- Branch protection on `main` still needs the "Test" check added manually in GitHub repo settings (Settings → Branches → main → required status checks) — not scriptable from this plan, out of scope per the spec.
- Follow-up work (mocks for route handlers/Server Actions, 100% coverage enforcement) is tracked in LES-236 and LES-237, not part of this plan.
