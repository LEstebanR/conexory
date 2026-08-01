---
description: Full process for developing a Conexory Linear issue, step by step — from reading it to the PR, scaling rigor to the change's real size. Resumes work already started.
argument-hint: [LES-XXX]
---

# Develop a Linear issue

Guides the complete development of a Conexory (`LEstebanR/conexory`) Linear issue, from reading it to opening the PR and leaving a record in the vault. Follow the steps in order, announce which step you're on, and respect the user's checkpoints — but **scale the rigor to the change's real size** (Step 2): not every issue needs the full flow.

Use `$ARGUMENTS` as the issue ID (`LES-XXX`). If missing, try to infer it from the current branch (`git branch --show-current`, pattern `LES-\d+`); if that's not possible either, ask the user what it is.

This skill can start a development from scratch or resume one already started in a previous session — Step 0 decides where to enter.

## Guard

Verify you're in the right repo: `git remote get-url origin` must contain `LEstebanR/conexory`. If not, say this skill is Conexory-specific and abort.

## Cross-cutting rules

- Never `git commit` or `git push` without the user's explicit authorization at that moment — not even inside the `/create-pr` flow (Step 8), and even if they already approved something similar earlier in the same conversation.
- Don't invent scope, acceptance criteria, or product decisions that aren't backed by the issue or by what the user says. If something isn't clear, ask before implementing — global `CLAUDE.md` rule.
- The Linear issue is this project's only tracking source: there's no separate GitHub Issues layer to sync.
- The Obsidian vault (`01-projects/conexory/`) is the durable record of this work, in addition to (not instead of) Claude Code's memory — see Step 10.

## Process

### Step 0 — Detect where to start from

Resolve the issue ID and check whether work has already started:
- Existing branch: `git branch -a | grep <LES-n>`
- Existing PR: `gh pr list --search "<LES-n>" --state all --json number,title,url,isDraft,state,baseRefName`

Decide the entry point:
- Nothing exists → Step 1.
- Branch with commits, no PR, no clear approved plan → resume from Step 3 using the branch's state as context (don't repeat already-answered questions if they can be inferred from the commits).
- Branch with commits that already implement a clear plan, no PR → Step 6 (pre-PR code review).
- PR already open without the real `/code-review` run yet → Step 9.
- PR already open and reviewed, or already approved/merged and only the record is missing → Step 10.

Announce in one line the chosen entry point and why, before continuing.

### Step 1 — Read the issue

`mcp__linear-server__get_issue({ id: "<LES-n>" })` + `mcp__linear-server__list_comments({ issueId: "<LES-n>" })` for extra context. If `get_issue` shows relations (blockers, duplicates), pull those too with `includeRelations: true`.

### Step 2 — Calibrate the process's rigor

Before continuing, classify the issue:
- **Small and mechanical** (a single file or a well-specified change, no architecture decisions, no real scope ambiguity): skip the clarifying questions and the plan checkpoint (Steps 3 and 4) — go straight to Step 5, noting in one line what you're about to do.
- **Multi-file or with real design/architecture decisions**: follow the full flow (Steps 3 and 4).

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

Before touching code, create the branch from `main` following `AGENTS.md`'s convention: `git checkout -b {type}/LES-{n}-{kebab-case-description}` (`{type}` = `feat|fix|refactor|chore|docs`). If a branch for this issue already exists (Step 0), reuse it instead of creating a new one.

Implement following `AGENTS.md`'s conventions: Server Components by default, Zod on every new Server Action, the Prisma singleton (`lib/prisma.ts`), Tailwind's semantic tokens (never `tailwind.config.js`), `getAppUrl()` for any absolute URL. If the change touches `prisma/schema.prisma`, use the `/db` skill to generate the migration — never `prisma db push`.

For UI changes, validate the real flow in `bun dev` before considering the step done (global `CLAUDE.md` rule).

If a real deviation from the approved plan comes up (something not accounted for, a scope change), tell the user — don't silently treat it as part of the original plan.

### Step 6 — Pre-PR code review

`/code-review` is meant to review a PR already opened on GitHub (it uses `gh`, comments there) — it doesn't exist yet at this point in the flow, it's only created in Step 8. Don't invoke it here.

Run `/review-conexory` (this project's own invariants) over the local diff, and also do your own pass of generic correctness over the same diff (equivalent in spirit to what `/code-review` would do, but manual: obvious bugs, edge cases, nothing Conexory-specific).

Resolve blocking findings before continuing (with the same criterion of announcing before applying non-trivial changes). Minor suggestions, decide with the user: now or leave for later.

### Step 7 — Checkpoint: user's manual review

The automated code review (Step 6) doesn't replace the user reviewing the code themselves. Tell them the diff is ready for their own review and wait for their explicit approval before moving to Step 8 — don't assume that passing Step 6 with no blocking findings is equivalent to this approval, they're two distinct checkpoints.

If the user asks for changes, adjust and wait for their approval again before continuing.

### Step 8 — PR: commit, checks, description and creation

Follow the full `/create-pr` skill: validate/create the branch, group the changes into commits following the project's conventions, run locally the same checks as CI (`bun install --frozen-lockfile`, `bunx prisma generate`, `bun typecheck`, `bun lint`), draft the PR description with the `.github/pull_request_template.md` template from the real diff.

Show the user the proposed description (title + body) **before** creating the PR and wait for their approval — it's a checkpoint, not a formality. Only push and create the PR afterward.

Show the PR URL to the user.

### Step 9 — Post-PR code review

`/code-review` (the real multi-agent one: 5 parallel Sonnet agents + scoring, comments directly on the GitHub PR) is expensive in time and tokens — a full run can take several minutes and consume hundreds of thousands of tokens. Scale this step with the same criterion as Step 2:

- **If Step 2 classified the change as small and mechanical:** skip this step — the manual review from Step 6 is already enough. Say so in one line and move to Step 10.
- **If Step 2 marked it as multi-file or with real design decisions:** run `/code-review` on the now-open PR — only here does it have a PR to operate on.

If at any point the user asks to cut the run short (cost, time, or because it isn't warranted), use `TaskStop` on the in-flight agents instead of letting them finish, and don't comment on the PR with partial results.

Resolve the blocking findings it reports, with the same criterion of announcing before applying non-trivial changes; if a fix needs to be pushed, it's a new commit on the same branch, not an amend.

### Step 10 — Update the vault and the Linear issue

1. Update the vault's dev journal: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Esteban/01-projects/conexory/diario-desarrollo/2026/<YYYYMM>-desarrollo-conexory.md` — add a bullet under today's heading (`### D DayName`) describing what was done, on which branch/PR, and relevant decisions or gotchas, in the same narrative tone (Spanish, first person, past tense) as the existing entries. If the month doesn't exist yet, create it and link it from `diario-desarrollo/desarrollo-conexory.md`.
2. If the change is significant (new feature, product or architecture decision — not a minor fix), also update `01-projects/conexory/conexory.md`: `en_progreso`, `Notas`, `milestones` progress if applicable.
3. Update the issue's status in Linear (`mcp__linear-server__save_issue`) to whatever state fits the team's workflow (e.g. "In Review") and leave the PR link as a comment or link attachment.

### Step 11 — Reflect on the skill

Before closing, review how the process went in this run: real friction, redundant steps, something you should have asked and didn't, a step that could have been skipped or that actually needed more rigor than it got, missing information. If you find something concrete and actionable, ask the user if they want you to adjust this skill (`.claude/commands/dev-issue.md`) before finishing — don't edit it without asking. If there's nothing relevant, don't say anything about it.

### Step 12 — Close

Summarize in 2-3 lines what was done and where it landed: PR status (open/merged), whether the vault was updated, and the issue's final status in Linear.
