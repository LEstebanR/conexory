---
name: review-conexory
description: Full code review of a Conexory change (local diff, branch or PR) — scope vs. issue, automated checks (types, lint, tests, coverage guard), security/authz, project invariants, data & migrations, payments, caching/perf, UI/design system, SEO, tests and code quality — with every finding verified before it's reported. Use when asked to review code, a branch, a diff or a PR in this repo, or as the pre-PR review step of /dev-issue.
argument-hint: "[PR# | branch | path] [--quick | --deep] [--comment]"
---

# Code review — Conexory

The most complete review this repo has: it combines generic correctness with the invariants only this project has. It **does not modify code** — it reports findings. Fixes are applied only if the user asks after reading the report.

Detailed checklists live next to this file and are read in Phase 3:
- `references/project-invariants.md` — Conexory's own rules and gotchas.
- `references/generic-checklist.md` — correctness, security, performance, tests and quality, applied to this stack.

Write the report in **Spanish** (natural Spanish punctuation, no em dash as an aside). Keep code identifiers as they are.

## Arguments

Parse `$ARGUMENTS`:

| Input | Target |
|---|---|
| (empty) | current branch vs `main` (`git diff main...HEAD`) **plus** uncommitted changes (`git diff HEAD`, and untracked files from `git status --porcelain`) |
| `123` / `#123` | GitHub PR: `gh pr view 123 --json number,title,body,headRefName,baseRefName,files,url` + `gh pr diff 123` |
| a branch name | `git diff main...<branch>` |
| a path (file/dir) | that path's changes vs `main`; if it has none, review the file(s) as they are |

Flags:
- `--quick` → skip Phase 2 (automated checks). Use for small iterations.
- `--deep` → Phase 3 is split across parallel subagents (see "Deep mode"). Only when the user passes it: it's expensive.
- `--comment` → after the report, offer to post the findings on the PR (Phase 6). Requires a PR target.

## Guard

`git remote get-url origin` must contain `LEstebanR/conexory`. If not, say this skill is Conexory-specific and stop.

## Hard rules

- **Never run `bun build` / `bun run build`**: the `build` script runs `prisma migrate deploy` against whatever `DATABASE_URL` points to. A review must never touch a database.
- Don't start `bun dev`, don't `curl` the app, don't run e2e (needs Postgres). Runtime verification is the user's; list it under "Para probar manualmente".
- Don't commit, push, or comment on GitHub without explicit approval in that moment.
- Report only what you verified (Phase 4). A short report with real findings beats a long one with guesses.

---

## Phase 1 — Scope and context

1. **Resolve the diff** per the table above. Get `git diff --stat` and the list of touched files.
2. **Intent.** Find what the change is supposed to do:
   - PR body (`Closes #N` → `gh issue view N --json title,body,comments`; Linear `LES-n` → `mcp__linear-server__get_issue` if available).
   - Branch name (`LES-\d+` → Linear; otherwise search with `gh issue list --search`).
   - Commit messages (`git log main..HEAD --format='%s%n%b'`).
   If there's no issue, infer intent from commits and say so in the report.
3. **Map files to risk areas** — these decide which checklist sections get the deepest look:

| Path pattern | Area |
|---|---|
| `app/**/actions.ts`, `app/api/**/route.ts*` | server write surface → security, Zod, authz, limits |
| `app/api/webhooks/**`, `app/api/cron/**`, `lib/mercadopago.ts`, `lib/subscription.ts`, `lib/orphan-subscriptions.ts`, `app/dashboard/upgrade/**` | **payments** → highest scrutiny |
| `lib/auth*.ts`, `app/login|register|forgot-password|reset-password/**`, `proxy.ts` | auth/session |
| `app/p/[slug]/**`, `app/agente/**`, `app/propiedades/**`, `lib/public-*.ts`, `lib/featured-properties.ts`, OG/flyer routes | public surface → data leaks, caching, SEO, the most important view of the product |
| `prisma/schema.prisma`, `prisma/migrations/**` | data & migrations |
| `lib/plans.ts` or anything reading `isPremium`/`role` | plans & limits |
| `components/**`, `app/**/*.tsx` | UI, design system, a11y, client bundle |
| `emails/**`, `lib/email.ts` | transactional email |
| `package.json`, `bun.lock`, `next.config.ts`, `vercel.json`, `.github/**`, `bunfig.toml` | deps, build, CI, ops |
| `content/blog/**`, metadata, sitemap, robots | SEO/content |

4. **Size the review.** Small (≤ ~150 changed lines, one area) → normal pass. Large or multi-area → be systematic: go area by area and say which areas you covered. Very large (≥ ~800 lines) → suggest `--deep` if it wasn't passed, but continue.
5. **Read beyond the hunks.** For every changed file read the whole modified function/component, not just the hunk. For every changed exported symbol, `grep` its callers and check they still hold. Read the sibling tests of changed modules.

## Phase 2 — Automated checks (skip with `--quick`)

Run what CI runs, from the worktree, and capture the result of each. Run them in parallel when independent:

```bash
bun --version                    # must match .bun-version (CI pins it); a mismatch explains local/CI coverage diffs
bunx prisma generate             # only if schema.prisma changed or the client looks stale
bun run typecheck
bun lint
bun run coverage                 # runs the whole unit suite + the 80% per-file threshold + lib/test-coverage-guard.test.ts
```

If `schema.prisma` changed, also run `bunx prisma validate` and compare **by hand** the new `prisma/migrations/*/migration.sql` against the schema diff (every added/removed/renamed column, default, index and relation must appear in the SQL, and nothing else). There's no shadow database configured; don't create one and don't run `migrate dev`/`migrate deploy`/`db push`.

For a PR target, also `gh pr checks <n>` to see CI status (branch-name, typecheck, lint, test, coverage, e2e).

Any failure here is at least 🟠, and 🔴 if CI would fail. Don't try to fix it: report the exact error output.

## Phase 3 — Review by dimension

Read **both** reference files now. Go through every dimension below against the diff, deepest in the areas flagged in Phase 1. Flag what the diff **introduces or re-exposes**; a pre-existing problem in an untouched area goes in a separate "Preexistente" section, never mixed with the PR's findings.

1. **Intent & completeness** — does the diff do what the issue asks? Are acceptance criteria covered? Scope creep (unrelated changes)? Missing pieces (e.g. a new field written but never shown, or shown but not editable; create path updated but not edit path; UI changed but email/OG/flyer not)?
2. **Correctness** — logic, edge cases, null/empty, async/await, error paths, races (`generic-checklist.md` §1).
3. **Security & authorization** (`generic-checklist.md` §2 + `project-invariants.md` §Auth, §Public routes).
4. **Project invariants** — all of `project-invariants.md`.
5. **Data & migrations** (`project-invariants.md` §Prisma).
6. **Payments** — if any payment file is touched (`project-invariants.md` §Payments).
7. **Caching & performance** (`generic-checklist.md` §3 + `project-invariants.md` §Caching).
8. **UI, design system & accessibility** (`project-invariants.md` §Design system + `generic-checklist.md` §4).
9. **SEO, OG & public view** (`project-invariants.md` §SEO).
10. **Tests** (`generic-checklist.md` §5 + `project-invariants.md` §Tests).
11. **Code quality & maintainability** (`generic-checklist.md` §6).
12. **Ops** — env vars, crons, deps, CI (`project-invariants.md` §Ops).

When a dimension needs deep framework knowledge, the repo has skills you can lean on (load them only if the diff warrants it): `next-best-practices`, `next-cache-components`, `react-best-practices`, `composition-patterns`, `best-practices` (better-auth), `prisma-client-api`, `zod`, `accessibility`, `tailwind-css-patterns`. For anything Next.js 16 specific, the source of truth is `node_modules/next/dist/docs/`.

### Deep mode (`--deep` only)

Launch these in parallel with the Agent tool (general-purpose), each given: the diff range, the Phase 1 intent summary and area map, the two reference files to read, and the instruction to return findings in the Phase 5 format with a concrete failure scenario each, **without editing files**:
- A: correctness + data & migrations + payments
- B: security & authorization + public surface + SEO
- C: project invariants + UI/design system/a11y + code quality
- D: tests + caching/performance + ops

Meanwhile do your own pass on the highest-risk area. Then merge, dedupe, and run Phase 4 on **every** subagent finding yourself: subagents over-report.

## Phase 4 — Verify every finding

Before a finding goes in the report:
1. Re-read the exact code at `file:line` (as of the reviewed revision, not memory).
2. Write the **concrete failure scenario**: input/state → wrong output, crash, leak, CI failure. If you can't write one, it's a 🟡 suggestion at most, or drop it.
3. Check it's not already handled elsewhere (caller validates, Zod schema covers it, a test proves the opposite, `where` already scopes by `userId`).
4. Check it's in scope (introduced or re-exposed by the diff).
5. Assign severity:
   - 🔴 **Bloqueante** — bug that breaks a flow, security/data leak, wrong charge or lost payment state, migration that breaks prod, CI fails.
   - 🟠 **Importante** — project invariant violated, missing validation/test, perf regression on a public surface, a11y blocker, edge case users will hit.
   - 🟡 **Sugerencia** — maintainability, reuse of an existing helper, clearer naming, small UX polish.
   - 💬 **Nit** — style only. Keep these few.
   And confidence: **confirmado** (traced end to end) or **probable** (strong evidence, one link unverified — say which).

## Phase 5 — Report

```markdown
## Code review — <PR #/branch> · <título o intención en una línea>

**Veredicto:** ✅ Aprobar · 🟡 Aprobar con cambios menores · 🔴 Requiere cambios
<1-2 líneas: por qué>

**Qué hay que hacer** (una línea por hallazgo, en orden de prioridad):
1. 🔴 <acción concreta en imperativo: "Filtrar por `userId` en `deleteProperty`"> · `path/file.ts:42`
2. ...

**Alcance:** <N archivos, +A/−B> · Áreas: <pagos, vista pública, ...> · Issue: <#N / LES-n / sin issue>
**Cumple el issue:** <sí / parcial: qué falta / no>

### Checks automáticos
| Check | Resultado |
|---|---|
| typecheck | ✅ / ❌ <error> |
| lint | ... |
| tests + coverage (80%) + coverage guard | ... |
| prisma validate / migración | ... / n.a. |
| CI del PR | ... / n.a. |

### Hallazgos
#### 🔴 Bloqueantes
**1. <título que nombre el problema, no el área: "Cualquier usuario puede borrar propiedades ajenas">** · `path/file.ts:42` · confirmado
- **Qué pasa:** <en lenguaje simple, qué vive el agente, el cliente o el negocio; sin jerga sin explicar>
- **Por qué importa:** <consecuencia concreta: dinero, datos, confianza, SEO, CI; y la regla del proyecto si aplica>
- **Cómo se reproduce:** <pasos o estado → resultado incorrecto>
- **Solución propuesta:** <qué cambiar y dónde, en una frase>
  ```diff
  - código actual
  + código propuesto
  ```
  <si hay varias soluciones válidas: A y B con su tradeoff, y cuál recomiendas>

#### 🟠 Importantes
...
#### 🟡 Sugerencias
...
#### 💬 Nits
...

### Preexistente (fuera del alcance del PR)
**N. <título que nombre el problema>** · `path/file.ts:10` · confirmado/probable
- **Qué pasa:** ...
- **Solución propuesta:** <cambio concreto, con diff si es corto> · <¿issue aparte o se puede incluir aquí?>

### Para probar manualmente
- <flujos concretos a validar en el navegador/preview, incluyendo móvil y casos borde>

### Lo que está bien
- <2-4 bullets específicos, no relleno>
```

Omit empty sections. Number findings continuously across severities (preexisting ones included) so the user can say "arregla 1, 3 y 5". If there are no findings, say so plainly and still list what was checked.

Writing rules for findings (the reader must understand the problem and act on it without re-reading the code):
- **Every finding carries a solution.** A finding without a concrete, applicable fix doesn't go in the report. If the right fix is genuinely unclear, say exactly what to check to decide, and propose the most likely fix anyway.
- **Show the code.** The fix is a `diff` block against the real lines when it fits in ~15 lines; for larger fixes, name the files and the steps. Never just "add validation" or "consider refactoring".
- **Plain language first.** "Qué pasa" describes the effect on a person (agent, client, Luis) or on the system, not the mechanism. Explain any technical term the first time (e.g. "IDOR: un usuario puede actuar sobre datos de otro cambiando el id").
- **One problem per finding**, titled with the problem itself, not with the dimension ("Seguridad") or the file.
- Don't hedge the severity in prose; the emoji and the confidence label carry it.

End by offering, in one line: fix the selected findings, and (for a PR target) post them with `--comment`.

## Phase 6 — Post on the PR (`--comment` only)

1. Draft one inline comment per 🔴/🟠 finding (and 🟡 only if the user wants), in Spanish, short, with the fix. Show the drafts to the user and **wait for explicit approval**.
2. Post as a single review so it's one notification:
   ```bash
   gh api repos/LEstebanR/conexory/pulls/<n>/reviews -X POST --input review.json
   ```
   with `{"event":"COMMENT","body":"<resumen>","comments":[{"path":"...","line":N,"side":"RIGHT","body":"..."}]}`. Build `review.json` in the scratchpad directory. Lines must be on the PR diff's RIGHT side; findings outside the diff go in the summary body.
3. Never use `REQUEST_CHANGES`/`APPROVE` unless the user asks.

## Phase 7 — Retrospective (always, as the last step)

Run this every time, after the report (and after Phase 6 if it ran), even when the review found nothing. Its goal is that each run makes the next one better.

1. **Self-assessment.** Look back at this run and note, concretely:
   - Findings the user rejected or corrected (false positives) and why they slipped through Phase 4.
   - Bugs or issues the user (or CI) found that the review missed, and which checklist item should have caught them.
   - Checklist items that were noise for this kind of change, or rules that turned out stale vs. `AGENTS.md` / the code.
   - Friction in the process: a phase that was slow, redundant, or a command that failed.
2. **Ask the user.** Show a short "Retrospectiva" block with your 0-3 concrete improvement proposals (each: the problem it fixes in plain language, the file, and the exact text you'd add or change), then ask with `AskUserQuestion`: **"¿Qué se puede mejorar de esta review?"**, with options such as applying each proposal, "Nada, estuvo bien", and room for the user's own feedback (the automatic "Other" option). If you have no proposals, don't call `AskUserQuestion` (it rejects questions with fewer than 2 options): say in one line that there are no proposals and that the user can still share feedback in plain text.
3. **Apply only what the user approves**, as edits to `.claude/skills/review-conexory/` (`SKILL.md` for process, `references/*.md` for rules). Generalize: write the rule that would have caught the case, not a note about this PR. When `AGENTS.md` and a reference file disagree, `AGENTS.md` wins and the reference gets updated.
4. If the feedback is about the project rather than the skill (a new convention, a product decision), suggest where it belongs (`AGENTS.md` or memory) instead of putting it in the checklists.
5. Don't commit the skill edits; say they're pending so they ride along with the next PR or get their own `chore` PR.
