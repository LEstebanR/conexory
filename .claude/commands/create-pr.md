# /create-pr

Creates a complete Pull Request for the Conexory project: commits the changes following the conventions, runs **locally** the same checks CI validates (so the PR doesn't break), pushes and opens the PR with an already-drafted description.

Don't merge anything. Your job ends when the PR is open and you report its URL.

---

## Step 0 — Gather context

Run in parallel:

```bash
git branch --show-current
git status -s
git diff --stat HEAD
git log main..HEAD --oneline   # commits already made on this branch
```

Determine:
- **Type of change:** `feat` · `fix` · `refactor` · `chore` · `docs` (based on the nature of the diff).
- **Linear issue number (`LES-{n}`):** get it from the branch name if it already has one. If you don't know it, **ask Luis** — it's required for the branch format and the PR.
- **Short description** in kebab-case, English, max 5 words.

---

## Step 1 — Ensure a valid branch

The `branch-name.yml` workflow validates this regex on every PR and **fails** if it isn't met:

```
^(feat|fix|refactor|chore|docs)\/LES-[0-9]+-[a-z0-9-]+$
```

- If you're on `main`: create the branch → `git checkout -b {type}/LES-{n}-{description}`.
- If you're on a branch that **doesn't** match the regex: rename it → `git branch -m {type}/LES-{n}-{description}`.
- If it already matches: continue.

Validate the name against the regex yourself before continuing; don't let it fail in CI.

---

## Step 2 — Commit following the conventions

Group the changes into logical commits (one conceptual change per commit; don't mix a refactor with a feature). For each commit:

```bash
git add <files for this change>   # avoid blindly `git add -A`; review what goes in
git commit -m "$(cat <<'EOF'
{type}(LES-{n}): imperative-mood description, lowercase, no trailing period

Optional body explaining WHAT and WHY (not how — that's in the diff).
For several changes, use bullets:
- change one and its reason
- change two and its reason

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Commit rules:**
- **Subject:** `{type}(LES-{n}): ...` — same `{type}` and `{n}` as the branch, in imperative mood ("add", "fix", "validate"), ≤72 chars, no trailing period.
- **Body:** only if it adds value — the *why* and context the diff doesn't show. Omit it for trivial changes.
- **Trailer:** always end with the line `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Don't commit** secrets, `.env`, or `.vercel` (they're in `.gitignore` — verify with `git status` that none slip in).
- If you touched the Prisma schema, the **migration must go in the same PR** (use `/db` to generate it).

---

## Step 3 — Run CI locally (before pushing)

Reproduce exactly what the `ci.yml` jobs run. If anything fails, **fix it and restart this step** — don't push with red CI.

```bash
bun install --frozen-lockfile   # detects bun.lock drift (CI uses --frozen-lockfile and fails if it doesn't match)
bunx prisma generate            # the typecheck job runs this first
bun typecheck                   # tsc --noEmit
bun lint                        # eslint
```

- If `bun install --frozen-lockfile` fails because the lockfile is out of date: run `bun install` (no flag), commit the updated `bun.lock`, and repeat.
- Don't run `bun build` just to validate: it now includes `prisma migrate deploy`, which touches the database. CI does **not** run build; typecheck + lint are enough to reproduce CI.

Report the result of each check before continuing.

---

## Step 4 — Push

In this environment the remote is SSH but **no SSH keys are loaded**, so a plain `git push` fails. Use `gh`'s credential helper over HTTPS:

```bash
git -c credential.helper='!gh auth git-credential' push \
  https://github.com/LEstebanR/conexory.git HEAD:$(git branch --show-current)
```

If the push is rejected because the remote branch diverged, `fetch` with the same helper and rebase before retrying.

---

## Step 5 — Open the PR with a drafted description

Draft the description **from the real diff**, following the template in `.github/pull_request_template.md`. Don't leave placeholders: fill every section.

```bash
gh pr create \
  --base main \
  --head "$(git branch --show-current)" \
  --title "{type}(LES-{n}): short description in imperative mood" \
  --body "$(cat <<'EOF'
## What does this PR do?

(1-3 sentences: what problem it solves or what it adds.)

## Linear issue

Closes: https://linear.app/lesteban/issue/LES-{n}

## Type of change

- [x] `{type}` — (check only the one that applies)

## Main changes

- `path/file`: what changed and why
- ...

## How to test?

1. (concrete steps to verify; if it's UI, mention what to look at)
2.

## Checklist

- [x] The code compiles with no errors
- [x] No TypeScript errors (`bun typecheck`)
- [x] Lint passes (`bun lint`)
- [ ] Protected routes still work (auth) — if applicable
- [ ] If there are Prisma schema changes, the migration is included
- [ ] If there are new environment variables, they're in `.env.example`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- **Title:** same format as the main commit — `{type}(LES-{n}): ...`.
- Check off in the checklist only what you actually verified; leave unchecked what doesn't apply or wasn't tested, and say so.
- `gh` uses its HTTPS token, no SSH needed.

---

## Step 6 — Report

Close with a brief summary:
- PR URL.
- Included commits (subjects).
- Result of the local checks (typecheck / lint / lockfile).
- Any checklist item left unverified and why.
