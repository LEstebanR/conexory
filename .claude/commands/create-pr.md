# /create-pr

Crea un Pull Request completo para el proyecto MiAgente: commitea los cambios siguiendo las convenciones, corre **localmente** lo mismo que valida CI (para no romper el PR), pushea y abre el PR con una descripción ya redactada.

No mergees nada. Tu trabajo termina cuando el PR está abierto y reportas su URL.

---

## Paso 0 — Reúne el contexto

Corre en paralelo:

```bash
git branch --show-current
git status -s
git diff --stat HEAD
git log main..HEAD --oneline   # commits ya hechos en esta rama
```

Determina:
- **Tipo de cambio:** `feat` · `fix` · `refactor` · `chore` · `docs` (según la naturaleza del diff).
- **Número de issue de Linear (`LES-{n}`):** sácalo del nombre de la rama si ya lo tiene. Si no lo sabes, **pregúntale a Luis** — es obligatorio para el formato de rama y el PR.
- **Descripción corta** en kebab-case, inglés, máximo 5 palabras.

---

## Paso 1 — Asegura una rama válida

El workflow `branch-name.yml` valida este regex en cada PR y **falla** si no se cumple:

```
^(feat|fix|refactor|chore|docs)\/LES-[0-9]+-[a-z0-9-]+$
```

- Si estás en `main`: crea la rama → `git checkout -b {type}/LES-{n}-{descripcion}`.
- Si estás en una rama que **no** cumple el regex: renómbrala → `git branch -m {type}/LES-{n}-{descripcion}`.
- Si ya cumple: continúa.

Valida el nombre contra el regex tú mismo antes de seguir; no dejes que falle en CI.

---

## Paso 2 — Commitea siguiendo las convenciones

Agrupa los cambios en commits lógicos (un cambio conceptual por commit; no mezcles refactor con feature). Para cada commit:

```bash
git add <archivos del cambio>   # evita `git add -A` a ciegas; revisa qué entra
git commit -m "$(cat <<'EOF'
{type}(LES-{n}): descripción en imperativo, minúscula, sin punto final

Cuerpo opcional explicando QUÉ y POR QUÉ (no el cómo — eso está en el diff).
Para varios cambios, usa bullets:
- cambio uno y su razón
- cambio dos y su razón

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

**Reglas de commit:**
- **Asunto:** `{type}(LES-{n}): ...` — mismo `{type}` y `{n}` que la rama, en imperativo (“add”, “fix”, “validate”), ≤72 chars, sin punto final.
- **Cuerpo:** solo si aporta — el *porqué* y el contexto que el diff no muestra. Omítelo en cambios triviales.
- **Trailer:** termina siempre con la línea `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **No commitees** secretos, `.env`, ni `.vercel` (están en `.gitignore` — verifica con `git status` que no se cuelen).
- Si tocaste el schema de Prisma, la **migración debe ir en el mismo PR** (usa `/db` para generarla).

---

## Paso 3 — Corre CI en local (antes de pushear)

Reproduce exactamente lo que corren los jobs de `ci.yml`. Si algo falla, **arréglalo y vuelve a empezar este paso** — no pushees con CI roja.

```bash
bun install --frozen-lockfile   # detecta drift de bun.lock (CI usa --frozen-lockfile y falla si no cuadra)
bunx prisma generate            # job typecheck lo corre antes
bun typecheck                   # tsc --noEmit
bun lint                        # eslint
```

- Si `bun install --frozen-lockfile` falla por lockfile desactualizado: corre `bun install` (sin flag), commitea el `bun.lock` actualizado, y repite.
- No corras `bun build` solo para validar: ahora incluye `prisma migrate deploy`, que toca la base de datos. CI **no** corre build; con typecheck + lint basta para reproducir CI.

Reporta el resultado de cada check antes de continuar.

---

## Paso 4 — Pushea

En este entorno el remoto es SSH pero **no hay llaves SSH cargadas**, así que `git push` directo falla. Usa el credential helper de `gh` por HTTPS:

```bash
git -c credential.helper='!gh auth git-credential' push \
  https://github.com/LEstebanR/inmobiliaria.git HEAD:$(git branch --show-current)
```

Si el push se rechaza porque la rama remota divergió, haz `fetch` con el mismo helper y rebasa antes de reintentar.

---

## Paso 5 — Abre el PR con descripción redactada

Redacta la descripción **a partir del diff real**, siguiendo la plantilla de `.github/pull_request_template.md`. No la dejes con placeholders: llena cada sección.

```bash
gh pr create \
  --base main \
  --head "$(git branch --show-current)" \
  --title "{type}(LES-{n}): descripción corta en imperativo" \
  --body "$(cat <<'EOF'
## ¿Qué hace este PR?

(1-3 oraciones: qué problema resuelve o qué agrega.)

## Issue de Linear

Closes: https://linear.app/lesteban/issue/LES-{n}

## Tipo de cambio

- [x] `{type}` — (marca solo el que aplica)

## Cambios principales

- `ruta/archivo`: qué cambió y por qué
- ...

## ¿Cómo probar?

1. (pasos concretos para verificar; si es UI, menciona qué mirar)
2.

## Checklist

- [x] El código compila sin errores
- [x] No hay errores de TypeScript (`bun typecheck`)
- [x] Lint pasa (`bun lint`)
- [ ] Las rutas protegidas siguen funcionando (auth) — si aplica
- [ ] Si hay cambios en el schema de Prisma, la migración está incluida
- [ ] Si hay nuevas variables de entorno, están en `.env.example`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- **Título:** mismo formato que el commit principal — `{type}(LES-{n}): ...`.
- Marca en el checklist solo lo que realmente verificaste; deja sin marcar lo que no aplica o no probaste, y dilo.
- `gh` usa su token HTTPS, no necesita SSH.

---

## Paso 6 — Reporta

Cierra con un resumen breve:
- URL del PR.
- Commits incluidos (asuntos).
- Resultado de los checks locales (typecheck / lint / lockfile).
- Cualquier ítem del checklist que quedó sin verificar y por qué.
