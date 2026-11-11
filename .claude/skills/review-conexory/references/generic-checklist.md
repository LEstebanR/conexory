# Generic review checklist (applied to this stack)

Go through every section; skip items that clearly don't apply to the diff. Each item is a question to answer against the code, not a box to tick.

## 1. Correctness

- **Logic:** conditions inverted? off-by-one in limits (`>` vs `>=`)? wrong variable? early `return` skipping a needed side effect (invalidation, email, event record)?
- **Null/empty/undefined:** optional Prisma fields (`neighborhood?`, `area?`, `bedrooms?`...), empty arrays (`images: []`), empty strings from forms, `""` env vars. Does the UI render sensibly with each missing?
- **Numbers:** `Decimal` → `.toNumber()`; `Number("")` is `0`; `parseInt` without radix; floating point on money; NaN from `z.coerce.number()` on blank inputs.
- **Dates/timezones:** server runs in UTC, users in Colombia (UTC−5). "Today", month boundaries, renewal reminders and `premiumUntil` comparisons need the Colombia-aware helpers.
- **Async:** missing `await` (Next 16 APIs, Prisma calls, `del()` from Blob); `forEach(async ...)` that doesn't wait; unhandled promise rejections; fire-and-forget work that Vercel may kill after the response (use `after()` from `next/server` if it must run).
- **Error paths:** what does the user see when the DB, Blob, Mercado Pago, Resend or Gemini fails? A `catch` that swallows and returns success? A `try` around too much?
- **Error reporting (`reportError` / PostHog):** a new failure branch on a money, auth or email path must be reported, and its test must assert the report (not only the returned result). Expected conditions are not errors: Gemini free-tier `429`, Mercado Pago `404` on test notifications, better-auth `4xx` (rate limits, unknown user). Reporting those floods the tracker and hides real issues; they get a `console.warn`.
- **State & concurrency:** double submit (button not disabled while pending, `useActionState` pending state), two tabs, retried webhooks, cron overlapping with webhooks.
- **Client state:** stale state after a Server Action (missing `router.refresh()`/`revalidatePath`), `useEffect` dependency bugs, controlled/uncontrolled input switches, keys in lists (`key={index}` on reorderable lists like the photo uploader).
- **Server/Client boundary:** non-serializable props (functions, `Decimal`, `Date`, class instances) passed to Client Components; server-only modules (`lib/prisma`, `lib/auth`, secrets) imported from a `"use client"` file.
- **Regressions:** for every changed export, do all callers still work? Did a shared helper change behavior for a caller the PR didn't consider?

## 2. Security

- **AuthN:** every action/route that reads private data or writes checks the session first.
- **AuthZ / IDOR:** every query on user-owned data is scoped by `userId` in the same query; IDs from the client (form fields, params) are never trusted to identify the owner. Admin paths check `role`.
- **Input validation:** Zod at the boundary for actions, route handlers, webhooks and query params; lengths bounded (titles, descriptions, arrays of URLs) so a client can't store megabytes; enums validated.
- **Mass assignment:** spreading `parsed.data` or `formData` into `prisma.*.update({ data })` can let a client set `isPremium`, `role`, `userId`, `shares`, `published`. Writes must list fields explicitly or use a schema that excludes them.
- **Uploads:** size and type checked server-side (not just `accept=` on the input); stored under the user's path; image URLs saved to `Property.images` must be the app's Blob URLs, not arbitrary external URLs (SSRF/hotlinking/tracking pixels in the public page).
- **XSS:** `dangerouslySetInnerHTML` with user data; JSON-LD `</script>` breakout; user URLs in `href` (`javascript:` scheme), YouTube/social links validated (`lib/youtube.ts`, `lib/social.ts`).
- **Open redirects:** `callbackURL`/`redirectTo` from query params must be relative/same-origin.
- **Secrets:** nothing secret in `NEXT_PUBLIC_*`, client bundles, logs, error messages returned to the client, or test fixtures.
- **Webhooks & cron:** signature/secret verified before any work, fail closed when the secret is missing, constant behavior for unknown event types.
- **Rate/abuse:** unauthenticated endpoints (event tracking, contact, password reset, AI generation) can't be trivially abused for cost (Gemini, Resend) or data inflation.
- **Information disclosure:** error messages that reveal whether an email exists (login, register, forgot-password should be uniform where intended), stack traces to the client.

## 3. Performance

- **DB:** N+1 queries; missing `select`; unbounded `findMany` (no `take`) on growing tables; missing indexes for new filters; sequential awaits that could be `Promise.all`.
- **Public pages:** uncached queries (see Caching in project invariants); work in `proxy.ts`; heavy `generateMetadata` duplicating the page's query without `cache()`.
- **Rendering:** a Server Component turned into a Client Component without need; `"use client"` placed too high in the tree pulling big subtrees into the bundle; large libs imported statically in client code (lazy-load with `next/dynamic`).
- **Images:** `next/image` with proper `sizes`; LCP image `priority` on `/p/[slug]`; no unnecessarily large originals.
- **Client effects:** fetch-in-`useEffect` waterfalls that could be server data; re-renders from unstable props/inline objects in hot lists.
- **External calls:** timeouts on Mercado Pago/Gemini/Resend; no external call on the critical render path of public pages.

## 4. UI, UX & accessibility

- **States:** loading (pending buttons, skeletons), empty, error and success for every new UI path. Errors shown via toast or inline, in Spanish, actionable.
- **Mobile first:** works at 360px width; no horizontal scroll; tap targets ≥ 44px; fields stack on mobile.
- **Forms:** every input has an associated `<label>` (`htmlFor`/`id`) or `aria-label`; errors linked with `aria-describedby`/`aria-invalid`; correct `type`/`inputMode`/`autoComplete`; Enter submits.
- **Keyboard & focus:** everything reachable and operable by keyboard; visible focus ring; dialogs trap focus and return it (Radix does this if used correctly); no click handlers on non-interactive `div`s.
- **Semantics:** headings in order, one `h1` per page, buttons vs links used correctly, `alt` text on meaningful images (property photos: descriptive; decorative: `alt=""`).
- **Contrast:** `mute` (#afafaf) on white is low contrast; don't use it for essential text.
- **Motion:** respects `prefers-reduced-motion`.
- **Consistency:** matches existing patterns for the same thing elsewhere in the app (spacing, card shape, button variants, copy tone).

## 5. Tests

- Every new branch of server logic (action, route, lib function) has a test that exercises it, including the failure paths (no session, invalid input, limit reached, not owner).
- Bug fixes include a regression test that fails without the fix.
- Tests assert specific outcomes (returned error text, Prisma call arguments including the `userId` scope, emails sent), not just that something was called.
- Mocks are reset between tests; no reliance on test order; no real network/DB.
- Snapshot-like assertions on large objects that will churn are 🟡.
- Coverage guard and 80% per-file threshold hold (see project invariants).

## 6. Code quality & maintainability

- **Reuse:** does a helper already exist? Check `lib/format.ts`, `lib/dates.ts`, `lib/colombia-month.ts`, `lib/phone.ts`, `lib/slug.ts`, `lib/urls.ts`, `lib/plans.ts`, `lib/properties.ts`, `lib/utils.ts` (`cn`), `components/ui/*` before accepting new code that duplicates them.
- **Simplicity:** unnecessary abstraction, premature generalization, dead code, leftover `console.log`, commented-out code, TODOs without an issue.
- **Types:** no `any`; `as` casts justified (e.g. `form.get(...) as File | null` is fine after a check, a cast to silence a real mismatch is not); types derived from Zod (`z.infer`) or Prisma instead of duplicated by hand.
- **Naming:** names say what things are; no misleading names after a behavior change.
- **Size:** a component/function that grew past what fits in one read and mixes concerns; suggest a split only if it clearly helps.
- **Comments:** minimal, English, *why* only.
- **Consistency:** follows the patterns of neighboring files (actions shape, result types, error copy, file placement per `AGENTS.md` structure).
- **Surgical scope:** unrelated refactors or formatting churn mixed into a feature/fix PR make review harder; flag as 🟡 and suggest splitting.
