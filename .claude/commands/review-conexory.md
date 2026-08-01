# /review-conexory

Code review **specific to Conexory**: checks the diff against this project's own invariants and gotchas. It doesn't replace `/code-review` (which hunts generic correctness bugs) — this checks the rules that only apply here. Ideally run both.

Don't apply changes; report findings. Each with `file:line`, which project rule it violates, and the concrete impact.

---

## Step 0 — Gather the diff

```bash
git diff main...HEAD          # the PR's range
git diff HEAD                 # uncommitted changes (include them if any)
```

If you're given a PR/branch/file as an argument, review that target. For each hunk, also read the surrounding function (a bug on an untouched line of a modified function is in scope).

---

## Step 1 — Verify the project's invariants

Go through the diff looking for violations of **each** category. Flag only what the diff actually introduces or re-exposes.

### 1. Next.js 16 — async APIs (gotcha #1)
`headers()`, `cookies()`, `params` and `searchParams` are **Promises**. Missing `await` = bug.
- ❌ `const { id } = params` / `headers()` without `await` → `cookies()`, etc.
- ✅ `const { id } = await params`, `await headers()`, `auth.api.getSession({ headers: await headers() })`.
- Also check that Next 15 behavior isn't assumed in routing, metadata or caching.

### 2. Server Actions — Zod validation is mandatory
Every write action (`"use server"`) must validate its input with a Zod schema (in `lib/validations/`), **before** touching the DB.
- ❌ New action that uses `data.x` directly with no `safeParse`.
- ✅ `const parsed = Schema.safeParse(data); if (!parsed.success) return { success: false, error: ... }`.
- Verify the discriminated result pattern is returned (`{ success: true ... } | { success: false; error }`) instead of throwing raw errors at the client.

### 3. Public routes — don't leak agent data
The public view `/p/[slug]` (and any route with no login) **must not expose `userId`** or private agent data.
- ❌ A `select` that includes `userId`, the agent's email, or passes the full `user` object to the client.
- ✅ Only the property fields needed for the public render.

### 4. Prisma
- ❌ Instantiating `new PrismaClient()` — always use the singleton from `lib/prisma.ts`.
- ❌ Operating on `price` as a plain number without converting — it's `Decimal(15,2)`, use `.toNumber()`.
- ✅ `onDelete: Cascade` on new `User` relations.
- **Schema change without a migration** = bug: if the diff touches `prisma/schema.prisma`, it must include the migration in `prisma/migrations/` (see `/db`). Never `db push`.

### 5. Tailwind CSS 4
- ❌ Creating or editing `tailwind.config.js` — config goes in `globals.css` via `@theme`.
- ❌ Hardcoded colors outside the palette — use `brand-*` tokens (actions/highlights) and `slate-*` (neutrals).
- ✅ Class composition with `cn()` from `lib/utils.ts`.

### 6. Server vs Client Components
- ❌ Unnecessary `"use client"` (no hooks, events or real interactivity) — Server Component by default.
- If a new component is client-only because of a single detail, evaluate whether that detail can be isolated.

### 7. Real estate domain
- ❌ Hardcoding `"En venta"` ("For sale") — a property can be for rent or for sale. Use the corresponding field/type.
- ❌ UI text in English — the market is Colombia; user-visible strings in **Spanish**.
- Valid property types: `apartment | house | office | commercial | lot | warehouse`. Any other string is invalid.

### 8. Plans and limits
There's a `User.isPremium` flag (Free vs Pro) exposed in the session. Per-plan limits live in `lib/plans.ts` and are enforced server-side gated on `isPremium`. Free: 3 properties / 10 photos. Pro: 50 / 20. "Custom" has no flag (managed by contact).
- ❌ Hardcoding the limit numbers (3/50, 10/20) instead of using `propertyLimit()` / `photoLimit()` from `lib/plans.ts`.
- ❌ Promising a limit in the UI that the action doesn't enforce (copy↔enforcement mismatch).
- ✅ Deriving limits from `lib/plans.ts`; Zod validation with the Pro ceiling and the per-plan limit applied in the action.
- Note: there's still no payment gateway, so nobody is premium yet — but the code must already respect the per-plan model.

### 9. Images
- Uploaded to Vercel Blob via `POST /api/upload` and stored as an array of URLs in `Property.images`.
- ❌ Using `<img>` instead of `next/image` (CI/ESLint flags this as an error).
- Respect the 10-photo limit.

### 10. Auth
- ✅ Session via `auth.api.getSession({ headers: await headers() })`.
- ✅ Protect routes: redirect to `/login` if there's no session, to `/dashboard` if there already is one.
- Note: `emailVerified` exists but is **not currently validated** — don't build logic that assumes it is.

### 11. Environment variables
- If the diff introduces a new env var, it must be documented in `.env.example`.
- ❌ Hardcoding secrets or URLs that should be env vars.

---

## Step 2 — Report

List the findings, **most severe first** (correctness/security > convention > style). For each one:

```
[category] file:line
  Rule: (which project invariant it violates)
  Impact: (what concretely breaks — crash, data leak, CI failure, debt)
  Fix: (the concrete correction)
```

If there are no project-rule violations, say so clearly and remind to run `/code-review` for the generic correctness pass. If you find correctness bugs that aren't project-specific, mention them but clarify that `/code-review` is the right tool for that layer.
