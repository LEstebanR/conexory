---
description: Creates a well-formed GitHub Issue for Conexory, using the project template and labels consistent with the type/priority convention.
argument-hint: [free-form issue description]
---

# Create a GitHub issue

Creates an issue on GitHub Issues (`LEstebanR/conexory`) following the project template (`.github/ISSUE_TEMPLATE/tarea.md`). This is the tracking flow for issues Luis manages directly — Linear still exists for older issues and for whatever his partner manages, but it isn't the source for this command (see "Work tracking" in `AGENTS.md`).

Use `$ARGUMENTS` as the issue's starting point (free-form title/description). If it's empty or too incomplete, ask.

## Guard

Check the repo: `gh repo view --json nameWithOwner --jq .nameWithOwner` must return `LEstebanR/conexory`. If not, say this command is Conexory-specific and abort.

## Step 1 — Gather the information

From `$ARGUMENTS` and the conversation's context, identify:

- **Title**: short, in imperative mood or a clear noun phrase (like a PR title, no type prefix).
- **Context**: why this is needed — what problem it solves or what's motivating it. If it isn't obvious, ask before making it up (global `CLAUDE.md` rule: don't assume unsupported scope or motivation).
- **What needs to be done**: concrete scope.
- **Acceptance criteria**: how you know it's done. If the user doesn't give them explicitly, propose a draft from the context and tell them to adjust it — don't silently treat your own assumption as settled.
- **Technical notes** (optional): design decisions, relevant files, discarded alternatives, if already discussed in the conversation.

Don't ask just to ask: if the conversation already has all of this (e.g. it comes from prior research or discussion), draft it directly and move to Step 2.

## Step 2 — Classify type and priority

**Type** (determines the label, fixed mapping — don't invent new labels):

| Nature of the issue | Label |
|---|---|
| New feature | `enhancement` |
| Bug / something broken | `bug` |
| Reorganization with no behavior change | `refactor` |
| Config, dependencies, infrastructure, provider migrations | `chore` |
| Documentation | `documentation` |

If the issue spans more than one type (e.g. a big migration that will later be split into several PRs of different `{type}`), use the label that best describes the issue **as a whole initiative**, and say so explicitly in "Technical notes".

**Priority** — apply one of `priority: alta` / `priority: media` / `priority: baja`. If it isn't obvious from context (e.g. something blocking a real user vs. a background improvement), ask Luis instead of assuming.

## Step 3 — Checkpoint: show the draft

Show the title, full body (with the template's structure) and chosen labels **before** creating the issue. Wait for explicit approval — same as the PR description checkpoint in `/create-pr`. If they ask for changes, adjust and show again.

## Step 4 — Create the issue

```bash
gh issue create \
  --repo LEstebanR/conexory \
  --title "<title>" \
  --label "<type>,priority: <priority>" \
  --body "$(cat <<'EOF'
## Context

<context>

## What needs to be done

<scope>

## Acceptance criteria

- [ ] <criterion 1>
- [ ] <criterion 2>

## Technical notes

<notes, if applicable — omit the section if there's nothing>
EOF
)"
```

## Step 5 — Report

Return the number and URL of the created issue. Note in one line that, when work starts on it, the branch has **no number** (`{type}/{short-description}`, see `AGENTS.md`) and the PR must carry `Closes #<number>` so it auto-closes on merge.
