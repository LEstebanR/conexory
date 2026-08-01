# /retrospective

You are a synthesis and memory agent. Your only mission is to study the current session, extract what's worth retaining long-term, and update the relevant Claude files. Do nothing else.

---

## Step 1 — Read the current state of memory

Read these files before making any changes:

```
.claude/memory/MEMORY.md
.claude/memory/project_conexory.md
.claude/memory/reference_linear.md
.claude/memory/user_profile.md
.claude/memory/feedback_general.md
```

If any doesn't exist, create it from scratch with the correct structure (see "File schema" section below).

---

## Step 2 — Study the current session

Review the whole conversation of this session. For each exchange, ask yourself:

**What did I learn about the user?**
- Did any preference about how they want me to work with them change?
- Did they correct any of my behavior? ("don't do X", "I prefer Y")
- Did they confirm any approach? ("perfect", "exactly like that", accepted without pushback)
- Did they show expertise on a new topic?

**What did I learn about the project?**
- Did the goals, scope or priorities change?
- Were architectural or product decisions made?
- Was the roadmap or milestones updated?
- Are there new constraints (technical, business, deadlines)?

**What changed in external references?**
- Were Linear issues created or modified?
- Are there new relevant URLs, projects or external resources?

**What is NOT worth saving?**
- Code that's already in the repo
- Implementation details that can be derived from the code
- Ephemeral session context with no future value
- Things already documented in CLAUDE.md / AGENTS.md

---

## Step 3 — Decide what to update

For each finding, determine the correct file:

| Type of finding | File |
|---|---|
| Behavior preference or correction | `.claude/memory/feedback_general.md` |
| User profile, expertise, context | `.claude/memory/user_profile.md` |
| Project state, decisions, priorities | `.claude/memory/project_conexory.md` |
| References to external systems (Linear, Vercel, etc.) | `.claude/memory/reference_linear.md` |
| New established code convention or architecture | `AGENTS.md` |

**Golden rule:** if the finding wouldn't change how I behave in a future session, don't save it.

---

## Step 4 — Apply the changes

For each file to modify:

1. Read it first if you haven't already
2. Edit only the affected sections (don't rewrite what didn't change)
3. If you create a new file, add it to the `.claude/memory/MEMORY.md` index
4. If you modify `AGENTS.md`, make sure the changes are generalizable rules, not session details

---

## Step 5 — Show the report

When done, show this summary:

```
🔁 RETROSPECTIVE — [today's date]

UPDATED FILES
  - [file-name.md]: [what changed in 1 line]
  - ...

KEY LEARNINGS
  - [list of 3-7 bullets with the most important things extracted]

NO CHANGES (and why)
  - [things that might seem important but weren't saved, with reason]
```

If there's nothing relevant to save, say so directly: "Session with no new learnings to persist."

---

## Canonical file schema

```
.claude/
  commands/
    retrospective.md          ← this skill
  memory/
    MEMORY.md                 ← index of all files
    feedback_general.md       ← behavior corrections and preferences
    project_conexory.md       ← project state, stack, decisions
    reference_linear.md       ← Linear: IDs, how to look up issues
```

### `MEMORY.md` — index
```markdown
# Memory Index

- [General feedback](feedback_general.md) — behavior corrections and preferences
- [Conexory project](project_conexory.md) — project state, stack, decisions
- [Linear — Conexory](reference_linear.md) — workspace, IDs, how to look up issues
```

### `feedback_general.md`
```markdown
---
name: feedback-general
description: Luis's corrections and preferences on how Claude should behave in this project
metadata:
  type: feedback
---

[content]
```

### `project_conexory.md`
```markdown
---
name: project-conexory
description: Conexory project state — stack, decisions, current priorities
metadata:
  type: project
---

[content]
```

### `reference_linear.md`
```markdown
---
name: reference-linear-conexory
description: Luis's Linear workspace — project ID, team, milestones
metadata:
  type: reference
---

[content]
```
