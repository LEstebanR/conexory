---
name: project-conexory
description: Conexory project context — what it is, stack, and current functional state
metadata:
  type: project
---

Conexory is a SaaS for real estate agents in Colombia. Freemium with three plans:
- **Free:** 3 active properties, 10 photos per property.
- **Pro ($99,999 COP/month):** 50 properties, 20 photos per property.
- **Custom:** teams/agencies, no limit, by contact (`/contacto`).

**Stack:** Next.js 16.2.6, React 19, TypeScript, Tailwind CSS 4, better-auth, Prisma 5 + Neon PostgreSQL, Vercel Blob, Bun, Vercel deploy.

**Working today:** property creation, unique link, WhatsApp sharing with OG preview, email+Google auth, blog, pricing and roadmap pages.

**Plan system — current state (changed):** the `User.isPremium` (boolean) flag already exists on the model and is exposed in the session (server-side via `getSession`, client-side via `useSession` — auth-client uses `inferAdditionalFields` to type it). Per-plan limits live in `lib/plans.ts` (`propertyLimit()`/`photoLimit()`, single source of truth) and **are enforced (real enforcement) server-side in the server actions**, gated on `isPremium`. It's NO LONGER "assume free for everyone": the code must respect the per-plan model and derive every limit from `lib/plans.ts` (never hardcode 3/50 or 10/20).

**Product decision:** plans are presented in the UI as **already launched** (not "coming soon"); the Pro CTA on `/precios` links to registration.

**Pending to complete the MVP:** payment gateway (Wompi or Stripe) and subscriptions. Until it's integrated, **nobody is premium** (there's no way to assign `isPremium`), but per-plan enforcement is already in place.

**Pricing (Colombian market):** real estate values are handled in millions/billions of COP and take up a lot of space. Convention: in tight-space UI (cards/lists) use compact millions format (`$580 M`, `$1,250 M` — `formatCompactCOP` helper in `app/dashboard/page.tsx`); in dashboard detail and the public view `/p/[slug]` show the **full exact value** (a buyer needs the real price).

**Not going to be built:** visit statistics, custom domain, mobile app.

**Auth:** Google + email/password is enough for the Colombian market. No more OAuth providers will be added.

**GitHub infrastructure:** CI with typecheck and lint runs on every PR. Branch protection on `main` requires all checks to pass. Mandatory branch format: `{type}/LES-{number}-{description}`.

**Pending image compression:** browser-image-compression client-side + sharp server-side, convert to WebP, incoming limit 20 MB (stored result ~200–500 KB).

**How to apply:** When proposing new features or changes, keep in mind that the payment gateway is the MVP's priority (it's the only thing missing to activate real premium). Every per-plan limit must be derived from `lib/plans.ts` and enforced server-side gated on `isPremium` — never hardcode the numbers or assume "free for everyone."
