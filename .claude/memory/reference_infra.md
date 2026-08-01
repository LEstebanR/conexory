---
name: reference-infra-conexory
description: Conexory infrastructure — Neon (branches), Vercel (env scoping) and git access in this environment
metadata:
  type: reference
---

## Neon (PostgreSQL)

Neon project: `conexory` (`late-shape-55166232`, org `org-dark-heart-49924774`). Two branches:
- **`production`** (`br-round-art-aqdl929i`, endpoint `ep-proud-unit-aqpl2g8k`) — primary/default, real data.
- **`development`** (`br-wandering-tree-aqhqb7og`, endpoint `ep-fancy-violet-aqpmrxha`) — persistent dev branch (had its 24h TTL removed). Copy-on-write copy of prod with migrations already applied.

`neonctl` authenticates via OAuth in the browser (no `NEON_API_KEY` loaded). DB role: `neondb_owner`, database `neondb`.

## Vercel

Project: `conexory` (team `lestebanrs-projects`, user `lestebanr`). The `vercel` CLI is installed and authenticated.

**`DATABASE_URL` / `DIRECT_URL` scoping per environment:**
- **Production** → Neon branch `production`
- **Preview** + **Development** → Neon branch `development`

This is critical because `build` runs `prisma migrate deploy`: so preview deploys apply migrations against **dev**, never against production. When changing these vars, Vercel used to store a single value across several environments — removing one scope deletes the whole value, so each environment has to be re-added separately (`vercel env add NAME <env>`).

Local `.env` points at the `development` branch (both `DATABASE_URL` and `DIRECT_URL` — both must match environments, since migrations use `DIRECT_URL`).

## Git access in this environment

The `origin` remote is **SSH** (`git@github.com:LEstebanR/conexory.git`) but there are **no SSH keys loaded** in the agent, so `git fetch`/`push` over SSH fail with `Permission denied (publickey)`. The `gh` CLI is authenticated though (account `LEstebanR`, ssh protocol, via keyring).

**Workaround for fetch/push** — use `gh`'s credential helper over HTTPS:
```
git -c credential.helper='!gh auth git-credential' push  https://github.com/LEstebanR/conexory.git HEAD:<branch>
git -c credential.helper='!gh auth git-credential' fetch https://github.com/LEstebanR/conexory.git <branch>
```

See [[reference-linear-conexory]] for Linear and [[project-conexory]] for product context.
