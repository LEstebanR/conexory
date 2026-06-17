---
name: reference-infra-conexory
description: Infraestructura de Conexory — Neon (branches), Vercel (env scoping) y acceso git en este entorno
metadata:
  type: reference
---

## Neon (PostgreSQL)

Proyecto Neon: `conexory` (`late-shape-55166232`, org `org-dark-heart-49924774`). Dos branches:
- **`production`** (`br-round-art-aqdl929i`, endpoint `ep-proud-unit-aqpl2g8k`) — primary/default, datos reales.
- **`development`** (`br-wandering-tree-aqhqb7og`, endpoint `ep-fancy-violet-aqpmrxha`) — branch de dev persistente (se le quitó el TTL de 24h). Copia copy-on-write de prod con las migraciones ya aplicadas.

`neonctl` se autentica por OAuth en el navegador (no hay `NEON_API_KEY` cargada). DB role: `neondb_owner`, database `neondb`.

## Vercel

Proyecto: `conexory` (team `lestebanrs-projects`, usuario `lestebanr`). El CLI `vercel` está instalado y autenticado.

**Scoping de `DATABASE_URL` / `DIRECT_URL` por entorno:**
- **Production** → Neon branch `production`
- **Preview** + **Development** → Neon branch `development`

Esto es crítico porque el `build` corre `prisma migrate deploy`: así los preview deploys aplican migraciones contra **dev**, nunca contra producción. Al cambiar estas vars, Vercel guardaba un único valor para varios entornos — quitar un scope borra el valor completo, hay que re-agregar cada entorno por separado (`vercel env add NAME <env>`).

`.env` local apunta al branch `development` (tanto `DATABASE_URL` como `DIRECT_URL` — ambas deben coincidir de entorno, porque las migraciones usan `DIRECT_URL`).

## Acceso git en este entorno

El remoto `origin` es **SSH** (`git@github.com:LEstebanR/conexory.git`) pero **no hay llaves SSH cargadas** en el agente, así que `git fetch`/`push` por SSH fallan con `Permission denied (publickey)`. El CLI `gh` sí está autenticado (cuenta `LEstebanR`, protocolo ssh, vía keyring).

**Workaround para fetch/push** — usar el credential helper de `gh` por HTTPS:
```
git -c credential.helper='!gh auth git-credential' push  https://github.com/LEstebanR/conexory.git HEAD:<branch>
git -c credential.helper='!gh auth git-credential' fetch https://github.com/LEstebanR/conexory.git <branch>
```

Ver [[reference-linear-conexory]] para Linear y [[project-conexory]] para contexto de producto.
