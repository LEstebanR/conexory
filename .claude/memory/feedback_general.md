---
name: feedback-general
description: Luis's corrections and preferences on how Claude should behave in this project
metadata:
  type: feedback
---

## Show a plan before executing

Before making any change, show what's going to be done and why.

**Why:** Luis wants to be able to anticipate the impact of what's about to happen before it happens.
**How to apply:** List the steps or files that will be touched, with one line of justification each. Don't execute until the plan has been shown. The plan doesn't need explicit approval — if Luis doesn't object, proceed.

## Explain what was done at the end

When finishing a task, include a summary of what changed and why.

**Why:** Luis wants to understand the result without having to infer it from the diff.
**How to apply:** Close every response with a clear summary: which files changed, what decisions were made, and what effect it has. Brief but complete.

## When creating Linear issues, include a detailed technical description

Issues must have enough context to be implemented without looking up more information: relevant files, schema changes, considerations, dependencies.

**Why:** Luis wants to be able to start working straight from Linear.
**How to apply:** Every issue must have at least: context, scope with specific bullets, and technical considerations.

## Component-level styles go in the component, not in global CSS

If a style applies to a specific element or component (e.g. `cursor-pointer` on a button), it goes in that component/class's own definition, not as a base rule in `globals.css`.

**Why:** Luis explicitly rejected putting a `button { cursor: pointer }` rule in `globals.css` — "that style should go in the component's definition."
**How to apply:** Resolve style inconsistencies in the affected component (or in the reusable base UI component, like `components/ui/button.tsx`), not with global rules/`@layer base`. Reserve `globals.css` for tokens and real resets, not for patching component behavior.

## Claude files are for development only

Don't include in AGENTS.md, CLAUDE.md, or the memory files: milestones, deadlines, target dates, issue status, or references to Linear IDs (LES-xxx). Luis manages that directly in Linear.

**Why:** Luis said so explicitly — Claude files are technical guidance, not project management.
**How to apply:** AGENTS.md = stack, conventions, patterns, what not to do. Memory = product context and behavior feedback. Nothing else.
