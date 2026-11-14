---
description: Full process for developing a Conexory issue (Linear or GitHub), step by step — from reading it to the PR, scaling rigor to the change's real size. Resumes work already started.
argument-hint: [LES-XXX | #N]
---

# Develop a Conexory issue

Guides the complete development of a Conexory (`LEstebanR/conexory`) issue, from reading it to opening the PR and leaving a record in the vault. Follow the steps in order, announce which step you're on, and respect the user's checkpoints — but **scale the rigor to the change's real size** (Step 2): not every issue needs the full flow.

Use `$ARGUMENTS` as the issue ID and resolve its **source** (it decides which tools Steps 1 and 10 use):
- `LES-XXX` → **Linear** issue.
- A bare number or `#N` → **GitHub** issue (`gh issue view N`). New issues live on GitHub since the Linear free plan hit its cap — see `AGENTS.md`.

If missing, try to infer it from the current branch (`git branch --show-current`, pattern `LES-\d+`; a branch without `LES-` points to a GitHub issue, so look it up with `gh issue list --search`); if that's not possible either, ask the user what it is.

This skill can start a development from scratch or resume one already started in a previous session — Step 0 decides where to enter.

## Guard

Verify you're in the right repo: `git remote get-url origin` must contain `LEstebanR/conexory`. If not, say this skill is Conexory-specific and abort.

## Cross-cutting rules

- Never `git commit` or `git push` without the user's explicit authorization at that moment — not even inside the `/create-pr` flow (Step 8), and even if they already approved something similar earlier in the same conversation.
- Don't invent scope, acceptance criteria, or product decisions that aren't backed by the issue or by what the user says. If something isn't clear, ask before implementing — global `CLAUDE.md` rule.
- Each issue lives in exactly one tracker (Linear or GitHub) — update only that one, never mirror it into the other.
- The Obsidian vault (`01-projects/conexory/`) is the durable record of this work, in addition to (not instead of) Claude Code's memory — see Step 10.

## Process

### Step 0 — Detect where to start from

Resolve the issue ID and check whether work has already started:
- Existing branch: `git branch -a | grep <LES-n>` (GitHub issues have no number in the branch: also check the current branch and `git log main..HEAD`)
- Existing PR: `gh pr list --search "<LES-n>" --state all --json number,title,url,isDraft,state,baseRefName` (for GitHub issues search `"Closes #N"`; matches by bare number are noisy, discard PRs unrelated to the issue)

Decide the entry point:
- Nothing exists → Step 1.
- Branch with commits, no PR, no clear approved plan → resume from Step 3 using the branch's state as context (don't repeat already-answered questions if they can be inferred from the commits).
- Branch with commits that already implement a clear plan, no PR → Step 6 (pre-PR code review).
- PR already open without its post-PR review (Step 9) yet → Step 9.
- PR already open and reviewed, or already approved/merged and only the record is missing → Step 10.

Announce in one line the chosen entry point and why, before continuing.

### Step 1 — Read the issue

- **Linear:** `mcp__linear-server__get_issue({ id: "<LES-n>" })` + `mcp__linear-server__list_comments({ issueId: "<LES-n>" })` for extra context. If `get_issue` shows relations (blockers, duplicates), pull those too with `includeRelations: true`.
- **GitHub:** `gh issue view N --json number,title,body,state,labels,comments`.

Don't take the issue's premises as facts: if it describes the current state of the system ("the setting X exists and has value Y"), verify it before acting. If it doesn't hold, tell the user and propose the adjusted approach before changing anything.

### Step 2 — Calibrate the process's rigor

Before continuing, classify the issue:
- **Small and mechanical** (a single file or a well-specified change, no architecture decisions, no real scope ambiguity): skip the clarifying questions and the plan checkpoint (Steps 3 and 4) — go straight to Step 5, noting in one line what you're about to do.
- **Multi-file or with real design/architecture decisions**: follow the full flow (Steps 3 and 4).

- **No code (infra/config only)** — e.g. Vercel domains, env vars, DNS, dashboards of external services: skip Steps 3–9 (no branch diff, no PR, no code review). Instead: verify the current state, **confirm with the user before any production change** (it's outward-facing even if small), apply it, and verify against the issue's acceptance criteria with real checks (`curl`, API reads). If the MCP returns 403 on a write, it's a scope limit of the integration, not of the account: the CLI with the user's own login is the fallback (`vercel api` needs a recent CLI version) — ask before upgrading global tools. Then go to Step 10.

If you're unsure which category it falls into, treat it as the big case. This doesn't exempt you from asking if a real, specific ambiguity comes up (e.g. an inconsistency in the issue itself) even if the change itself is small — that's always asked, regardless of size.

### Step 3 — Checkpoint: clarifying questions

Only if Step 2 marked it as non-trivial. Detect what's missing to propose a plan with confidence — ambiguous scope, several valid interpretations, incomplete acceptance criteria, unresolved dependencies. Use `AskUserQuestion`.

If the issue is already completely clear, say so explicitly and don't ask just to ask.

### Step 4 — Checkpoint: propose the plan

Only if Step 2 marked it as non-trivial. If it helps to explore the code before proposing the plan, do it — don't guess file paths or reinvent utilities that already exist in the repo.

Format (global `CLAUDE.md` rule):
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Wait for the user's explicit approval before touching code. If they ask for changes, adjust and ask again.

### Step 5 — Implement

Before touching code, create the branch from `main` following `AGENTS.md`'s convention (`{type}` = `feat|fix|refactor|chore|docs`):
- **Linear:** `git checkout -b {type}/LES-{n}-{kebab-case-description}`
- **GitHub:** `git checkout -b {type}/{kebab-case-description}` (no issue number in the branch)

If a branch for this issue already exists (Step 0), reuse it instead of creating a new one.

Implement following `AGENTS.md`'s conventions: Server Components by default, Zod on every new Server Action, the Prisma singleton (`lib/prisma.ts`), Tailwind's semantic tokens (never `tailwind.config.js`), `getAppUrl()` for any absolute URL. If the change touches `prisma/schema.prisma`, use the `/db` skill to generate the migration — never `prisma db push`.

For UI changes, validate the real flow in `bun dev` before considering the step done (global `CLAUDE.md` rule). Run it on port **3000**: better-auth rejects any other origin than `BETTER_AUTH_URL` (`Invalid origin`), so sign-in/sign-up/sign-out silently fail on another port. Before creating test accounts or data, confirm with the user that the local `.env` points at the dev database, and delete what you created when you're done.

If a real deviation from the approved plan comes up (something not accounted for, a scope change), tell the user — don't silently treat it as part of the original plan.

### Step 6 — Pre-PR code review

Run `/review-conexory` over the local diff. It's the only review skill for this repo: it covers generic correctness as well as the project's invariants, so don't add `/code-review` or a separate manual pass on top. Add `--deep` when Step 2 marked the change as multi-file or with real design decisions.

Resolve blocking findings before continuing (with the same criterion of announcing before applying non-trivial changes). Minor suggestions, decide with the user: now or leave for later.

### Step 7 — Checkpoint: user's manual review

The automated code review (Step 6) doesn't replace the user reviewing the code themselves. Tell them the diff is ready for their own review and wait for their explicit approval before moving to Step 8 — don't assume that passing Step 6 with no blocking findings is equivalent to this approval, they're two distinct checkpoints.

If the user asks for changes, adjust and wait for their approval again before continuing.

### Step 8 — PR: commit, checks, description and creation

Follow the full `/create-pr` skill: validate/create the branch, group the changes into commits following the project's conventions, run locally the same checks as CI (`bun install --frozen-lockfile`, `bunx prisma generate`, `bun typecheck`, `bun lint`), draft the PR description with the `.github/pull_request_template.md` template from the real diff.

Show the user the proposed description (title + body) **before** creating the PR and wait for their approval — it's a checkpoint, not a formality. Only push and create the PR afterward.

Show the PR URL to the user.

Then wait for CI with `gh pr checks <PR> --watch` (in the background) and don't move to Step 10 until it's green: local checks can pass while CI fails. If a test fails only in CI and the Bun version matches `.bun-version`, suspect test-file order: `mock.module()` is process-wide and CI's file order differs from macOS. Take the order from the job log (`gh api repos/LEstebanR/conexory/actions/jobs/<id>/logs | grep '##\[group\].*\.test\.tsx\?:'`) and reproduce with `bun test <files in that order>` before changing anything.

### Step 9 — Post-PR review

Don't use `/code-review`: `/review-conexory` is the review skill for this repo, and it was already run in Step 6.

- **If Step 2 classified the change as small and mechanical:** skip this step. Say so in one line and move to Step 10.
- **Otherwise:** run `/review-conexory <PR#> --since <sha reviewed in Step 6>`. It covers what only exists once the PR is open (CI status, PR body vs. final diff, parallel PRs) plus the commits added after Step 6. If nothing changed since Step 6 and CI is green, the report is just the verdict line. Add `--comment` only if the user wants the findings on GitHub.

Resolve the blocking findings it reports, with the same criterion of announcing before applying non-trivial changes; if a fix needs to be pushed, it's a new commit on the same branch, not an amend.

### Step 10 — Update the vault and the issue

1. Update the vault's dev journal: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Esteban/01-projects/conexory/diario-desarrollo/2026/<YYYYMM>-desarrollo-conexory.md` — add a bullet under today's heading (`### D DayName`) describing what was done, on which branch/PR, and relevant decisions or gotchas, in the same narrative tone (Spanish, first person, past tense) as the existing entries. If the month doesn't exist yet, create it and link it from `diario-desarrollo/desarrollo-conexory.md`.
2. If the change is significant (new feature, product or architecture decision — not a minor fix), also update `01-projects/conexory/conexory.md`: `en_progreso`, `Notas`, `milestones` progress if applicable.
3. Update the issue in its own tracker:
   - **Linear:** `mcp__linear-server__save_issue` to whatever state fits the team's workflow (e.g. "In Review") and leave the PR link as a comment or link attachment.
   - **GitHub:** if there's a PR, its `Closes #N` closes the issue on merge — nothing else to do. If there's no PR (no-code issue), `gh issue comment N` with what was done and the verification output, then `gh issue close N`.

### Step 11 — Reflect on the skill

Before closing, review how the process went in this run: real friction, redundant steps, something you should have asked and didn't, a step that could have been skipped or that actually needed more rigor than it got, missing information. If you find something concrete and actionable, ask the user if they want you to adjust this skill (`.claude/commands/dev-issue.md`) before finishing — don't edit it without asking. If there's nothing relevant, don't say anything about it.

### Step 12 — Close

Summarize in 2-3 lines what was done and where it landed: PR status (open/merged, or none for no-code issues), whether the vault was updated, and the issue's final status in its tracker.
