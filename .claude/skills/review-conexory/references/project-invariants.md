# Conexory — project invariants

Rules that only apply to this repo. `AGENTS.md` is the source of truth: if it disagrees with this file, follow `AGENTS.md` and propose updating this file.

## Next.js 16

- `headers()`, `cookies()`, `params`, `searchParams` are **Promises**. Missing `await` is a bug (`const { id } = params` ❌ → `const { id } = await params` ✅). Same in `generateMetadata`, route handlers and `opengraph-image`.
- Middleware is `proxy.ts` (Next 16 name), with `matcher: ["/", "/login", "/p/:slug"]`. It must stay cheap: it only checks the session **cookie exists** (never validates it against the DB) so the landing stays static and pings/crawlers don't wake Neon. Adding DB work or widening the matcher is 🟠 at least.
- Don't assume Next 15 behavior for caching, metadata or routing; check `node_modules/next/dist/docs/` when in doubt.
- `revalidateTag(tag, { expire: 0 })` is the Next 16 signature used in `lib/public-cache.ts`.

## Server Actions & route handlers

- Every write action (`"use server"`) validates input with **Zod** before touching the DB. Schemas live in `lib/validations/` or `lib/schemas/`, or as local `z.object` in the actions file (see `app/admin/actions.ts`). Zod is v4 (`zod@4`): check API usage (`z.email()`, `error.issues`, etc.).
- Return a discriminated result `{ success: true, ... } | { success: false; error: string }` with a Spanish, user-facing `error`. Don't throw raw errors to the client.
- Session via `getSession()` from `lib/auth.ts` (wraps `auth.api.getSession({ headers: await headers() })` and treats failures as signed out). Every action/route starts by checking it; missing session → `{ success: false, error: "Sesión expirada..." }` or 401.
- **Ownership:** every read/update/delete of a user-owned row scopes by owner in the same query: `where: { id, userId: session.user.id }`. A `findUnique({ where: { id } })` followed by an update without `userId` is an IDOR (🔴).
- **Admin:** `app/admin/**` actions check `session.user.role !== "admin"` first. Any new admin capability must too.
- Writes that change what public pages show must call `invalidatePublicListings()` (see §Caching) and, where the dashboard shows it, `revalidatePath`.
- Email/password auth goes through Server Actions (`app/login/actions.ts`, `app/register/actions.ts`) with `useActionState` + `<form action>`, mapping `APIError` from `better-auth/api`. Google OAuth is client-side `signIn.social`. Don't move email/password back to client calls.

## Auth (better-auth)

- `nextCookies()` must remain the **last** plugin in `lib/auth.ts`.
- Auth `baseURL`/origin uses the **current deploy's host** (`window.location.origin` / `VERCEL_URL` + `trustedOrigins`), never `getAppUrl()`.
- Protected pages redirect to `/login` without session; `/login`/`/register` redirect to `/dashboard` with session.
- `emailVerified` exists but is not enforced; don't build logic that assumes it is (unless the issue is exactly about enforcing it).
- Session cookie names: `better-auth.session_token` and `__Secure-better-auth.session_token`. Code that clears/sets cookies must handle both.

## Public routes — no data leaks

Public surfaces: `/p/[slug]` (+ `og.jpg`), `/agente/**`, `/propiedades/**`, landing, blog, sitemap, OG and flyer routes, `/api/properties/[id]/event`.
- Never expose `userId`, the agent's email (unless the agent opted in via `showContact`), `isPremium`, `role`, subscription data, or unpublished properties. Use explicit `select` with only what the render needs; passing a full Prisma `user`/`property` object to a Client Component serializes every field into the HTML (🔴).
- Unpublished listings must 404 (`proxy.ts` rewrites to `/__missing`; the page itself must also check `published`).
- JSON-LD via `dangerouslySetInnerHTML={{ __html: JSON.stringify(x) }}`: if `x` contains user-controlled text (titles, descriptions, names), a `</script>` inside it breaks out. It must be escaped (e.g. replace `<` with `<`) — 🔴 on public pages.
- Markdown rendered with `marked` is only for repo-owned blog content. Rendering user input through `marked`/`dangerouslySetInnerHTML` is XSS (🔴).
- Public event tracking (`/api/properties/[id]/event`) is unauthenticated: check it can't be abused to inflate other users' metrics beyond what's intended or to write arbitrary data.

## Plans & limits

- Free: 3 active properties / 10 photos. Pro: 50 / 20. Custom: by contact, no flag. Also `PINNED_LIMIT` (3, all plans) and AI message limits (`aiMessageLimit`).
- **Single source of truth: `lib/plans.ts`.** Hardcoding 3/50/10/20/etc. in UI or actions is 🟠 (copy and enforcement drift).
- Gating uses `hasProAccess(user)` (isPremium **or** admin). Billing logic uses `isPremium` only. Mixing them up is a bug: gating on `isPremium` locks admins out; billing on `hasProAccess` treats admins as paying customers.
- Enforcement happens **server-side** in the action. UI limits are a convenience, never the guard. Zod uses the absolute ceiling (Pro); the per-plan limit is applied in the action.
- Count-then-write limit checks (`count` → `create`) can race under concurrent submits; flag it if the diff introduces a new one on a path users can trigger in parallel (🟡 unless it's money-related).
- UI copy promising a limit must match what the action enforces.

## Payments (Mercado Pago) — highest scrutiny

Files: `lib/mercadopago.ts`, `lib/subscription.ts`, `lib/orphan-subscriptions.ts`, `app/api/webhooks/mercadopago/route.ts`, `app/api/cron/billing/route.ts`, `app/dashboard/upgrade/**`.
- Webhook verifies the `x-signature` (`verifyMercadoPagoWebhook`) **before** doing anything; 401 otherwise. Never trust the body's status: re-fetch the payment/preapproval from Mercado Pago.
- **Idempotency:** `PaymentEvent.externalId` = `${type}-${id}-${status}`. The status is part of the key on purpose (one object goes through several statuses). Changing the key shape is 🔴 unless justified.
- Always answer 200 for handled/ignored notifications; non-2xx makes MP retry. Throwing after a partial write can double-apply on retry: check ordering (record event → act) and transactions.
- **Orphan charges:** an approved charge for a deleted user or a user without a plan must cancel the preapproval, not be ignored.
- Cron (`vercel.json`, daily 09:00 UTC) authenticates with `Authorization: Bearer ${CRON_SECRET}` and must fail closed if the secret is empty. Bulk destructive actions are capped (`MAX_ORPHAN_CANCELS_PER_RUN`); a new bulk action needs a similar cap.
- Amounts: check units (COP vs cents) on every boundary. Price shown on `/precios` must match what's charged.
- State transitions: `isPremium`, `premiumUntil`, `Subscription` status and downgrade (`downgradeToFree`) must stay consistent. A downgrade must not delete data; check what happens to properties above the Free limit.
- Every outcome that the user should know about sends its email (`lib/email.ts`): confirmation, payment failed, renewal reminder, cancelled.
- Never log full card data, tokens or access tokens. `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` is public on purpose; `MERCADOPAGO_ACCESS_TOKEN`/`MERCADOPAGO_WEBHOOK_SECRET` must never reach the client.
- Testing gotcha: `bun:test` `mock.module()` is process-wide, which is why `lib/mercadopago.ts` is excluded from coverage. Tests of webhook/cron mock it; check new branches are covered there.

## Prisma & data

- Always the singleton from `lib/prisma.ts`; `new PrismaClient()` anywhere else is 🟠.
- `price` is `Decimal(15,2)`: `.toNumber()` before arithmetic/serialization. Passing a `Decimal` or `Date` to a Client Component or into `cachePublicQuery` breaks (it's JSON-serialized).
- **Schema change ⇒ migration in the same PR** (`prisma/migrations/<timestamp>_<name>/migration.sql`). Never `db push`. Missing migration is 🔴 (`prisma migrate deploy` runs on every Vercel build; Preview → dev DB, Production → prod DB).
- Review the migration SQL as production code:
  - Adding a `NOT NULL` column without a default to a table with rows fails on deploy (🔴).
  - Dropping/renaming columns loses data; a rename shows up as DROP + ADD in Prisma (🔴 unless intended and data is migrated).
  - Data backfills must be in the migration SQL, not a one-off script.
  - Edited old migrations break the history (🔴): only new folders.
- New relations to `User` use `onDelete: Cascade`.
- Multi-step writes that must be atomic use `prisma.$transaction`.
- Queries: explicit `select` on hot paths, no N+1 (loops with awaits inside), indexes for new `where`/`orderBy` columns on large tables (`Property`, `PropertyVisit`, `PaymentEvent`).
- Connection retries live in `lib/prisma-retry.ts`; don't add ad-hoc retry loops.
- Property types: `apartment | house | office | commercial | lot | warehouse` (labels in `lib/property-types.ts`). Transaction type is a field: never hardcode "En venta".
- Optional English fields (`titleEn`, `descriptionEn`, `bioEn`, `englishAvailable`): a change to the Spanish field's create/edit/display path usually needs the English one too.

## Caching (Neon autosuspend)

- Public reads go through `cachePublicQuery()` (`lib/public-cache.ts`, tag `public-listings`, 24h). A new uncached DB query on a public page keeps Neon awake (🟠).
- Every write that changes something a public page shows must call `invalidatePublicListings()`: create/edit/delete/publish/pin of properties, profile changes shown on `/agente`, plan changes that affect visibility. Missing it = stale public pages for up to 24h (🟠, 🔴 if it leaks data that was made private/unpublished).
- Cached values must be JSON-serializable primitives (no `Decimal`, `Date`, class instances).
- Request-level dedup uses React `cache()` (e.g. session/property fetchers shared by `generateMetadata` and the page).

## Design system (monochrome, `DESIGN.md`)

- Tokens: `ink`, `body`, `mute`, `canvas`, `canvas-soft`, `canvas-softer`, `surface-pressed`, `hairline`, `hairline-strong`, `elevated`, `warning-*`. `brand-*` is a legacy gray ramp; new code prefers semantic tokens.
- **No accent colors.** Hardcoded `amber-*`, `blue-*`, `green-*`, `violet-*`, `slate-*`, hex colors, etc. are 🟡/🟠. Exception: WhatsApp green `#25D366` only in product (app / public view contact), **never** on marketing pages (landing, precios, blog), where WhatsApp buttons are black.
- Primary CTAs are black (`bg-ink`, the default `Button`). Interactive elements are pills (`rounded-full`); cards `rounded-2xl`.
- Use `Button` from `components/ui/button.tsx` (extend `buttonVariants` with cva if a variant is missing). Raw `<button className="...">` for an action is 🟡. Exception: selection chips/toggle groups.
- `h1`–`h3` get Bricolage via base styles; headline-styled non-headings add `font-display`. Body text is Inter.
- No `alert()`/`confirm()`/`prompt()`: Sonner `toast` for feedback, Radix Dialog ("Cancelar" / "Sí, <acción>") for destructive confirmations.
- Two-column field grids: `grid-cols-1 sm:grid-cols-2`, never bare `grid-cols-2`.
- Marketing entrances: `animate-fade-up`/`animate-fade-in`, `components/reveal.tsx` (respects `prefers-reduced-motion`).
- No `tailwind.config.js`: Tailwind 4 config lives in `globals.css` `@theme`. Compose classes with `cn()`.
- Images: `next/image` (ESLint makes `<img>` an error). Uploaded photos are JPEG on purpose (WhatsApp doesn't render WebP previews).

## Copy & language

- All user-facing strings in **Spanish (Colombia)**, with correct accents/ñ/¿¡. The product **tutea** ("Actualiza", "Contáctanos"): no "usted".
- No em dash (—) as an aside in Spanish copy; use commas, parentheses or a period.
- Prices in COP formatted with the helpers in `lib/format.ts`; dates with `lib/dates.ts` / `lib/colombia-month.ts` (Colombia timezone). Hand-rolled `toLocaleString` / `new Date().getMonth()` on server code can be off by a day/month in UTC.
- Phone numbers through `lib/phone.ts`.
- Code comments in **English** and minimal: default is zero; only a non-obvious *why* that names can't carry. Comments explaining *what* are 💬/🟡.

## SEO, OG & public view

- `/p/[slug]` is the most important view of the product (shared on WhatsApp, acquisition channel). Regressions there in visuals, performance, OG preview or contact card are at least 🟠.
- Absolute URLs via `getAppUrl()` (`lib/urls.ts`). Reading `NEXT_PUBLIC_APP_URL` or hardcoding `conexory.com` is 🟠. Env URL vars can be `""`: derive with `||`, not `??`.
- Metadata via `lib/page-metadata.ts` / `lib/listing-seo.ts` / `lib/city-seo.ts` helpers; titles/descriptions in Spanish, canonical set, unpublished pages `noindex`/404.
- OG images: JPEG, 1200×630, tested by link preview. Changes to OG title/description: note that WhatsApp caches previews (verify with Facebook's sharing debugger, not WhatsApp).
- `sitemap.ts`/`robots.ts` must include new public routes and exclude private ones.

## Tests

- Unit tests with `bun test` next to the module (`foo.ts` → `foo.test.ts`). `lib/test-coverage-guard.test.ts` fails if a new module under `lib/**`, `app/**/actions.ts` or `app/**/route.ts(x)` has no sibling test and isn't in `UNTESTED_ALLOWLIST` with a reason. A new allowlist entry needs a real reason (static data, pure rendering), not "hard to test".
- Coverage threshold: **80% per file** (`bunfig.toml`), enforced in CI. Run `bun run coverage`; CI pins Bun via `.bun-version`.
- `mock.module()` is process-wide: mocking a module in one test file affects others. New mocks of shared modules (`lib/auth`, `lib/prisma`, `lib/mercadopago`) must not break other suites.
- E2E (Playwright, `e2e/`) covers login, access control, property lifecycle and sharing. A change to those flows should update the matching spec.
- Tests must assert behavior (result, DB call args, error message), not just "doesn't throw".

## Ops

- New env var ⇒ in `.env.example` with a comment, and read with `||` fallback where `""` is possible. Secrets never in `NEXT_PUBLIC_*`.
- New dependency ⇒ **exact version** (no `^`/`~`) in `package.json`, `bun.lock` updated, and justified (bundle cost on client components). Heavy client libs (`@dnd-kit/*`, `leaflet`, `canvas-confetti`, `driver.js`) are lazy-loaded; keep it that way.
- `vercel.json` crons and `scripts/vercel-ignore-build.sh` changes affect every deploy: review carefully.
- Transactional email via Resend with `FROM` on the verified `conexory.com` domain; templates in `emails/` (React Email).
- Branch name must match `^(feat|fix|refactor|chore|docs)/(LES-[0-9]+-[a-z0-9-]+|[a-z0-9-]+)$` (CI job). PR body follows `.github/pull_request_template.md` with `Closes #N` or the Linear link.
