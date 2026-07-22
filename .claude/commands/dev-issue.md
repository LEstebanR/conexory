---
description: Proceso completo para desarrollar un issue de Linear de Conexory, paso a paso — desde leerlo hasta el PR, escalando el rigor al tamaño real del cambio. Retoma desarrollos ya empezados.
argument-hint: [LES-XXX]
---

# Desarrollar un issue de Linear

Guía el desarrollo completo de un issue de Linear del proyecto Conexory (`LEstebanR/conexory`), desde leerlo hasta abrir el PR y dejar constancia en el vault. Sigue los pasos en orden, anuncia en qué paso vas, y respeta los checkpoints del usuario — pero **escala el rigor al tamaño real del cambio** (Paso 2): no todo issue necesita el flujo completo.

Usa `$ARGUMENTS` como ID del issue (`LES-XXX`). Si falta, intenta inferirlo de la rama actual (`git branch --show-current`, patrón `LES-\d+`); si tampoco es posible, pregúntale al usuario cuál es.

Esta skill puede arrancar un desarrollo desde cero o retomar uno ya empezado en una sesión anterior — el Paso 0 decide por dónde entrar.

## Guard

Verifica que estás en el repo correcto: `git remote get-url origin` debe contener `LEstebanR/conexory`. Si no, avisa que esta skill es específica de Conexory y aborta.

## Reglas transversales

- Nunca hagas `git commit` ni `git push` sin autorización explícita del usuario en ese momento — ni siquiera dentro del flujo de `/create-pr` (Paso 8), y aunque ya haya aprobado algo similar antes en la misma conversación.
- No inventes alcance, criterios de aceptación o decisiones de producto que no estén respaldados por el issue o por lo que diga el usuario. Si algo no está claro, pregunta antes de implementar — regla global de `CLAUDE.md`.
- El issue de Linear es la única fuente de tracking de este proyecto: no hay una capa de GitHub Issues separada que sincronizar.
- El vault de Obsidian (`01-projects/conexory/`) es el registro durable de este trabajo, además de (no en vez de) la memoria de Claude Code — ver Paso 10.

## Proceso

### Paso 0 — Detectar de dónde arrancar

Resuelve el ID del issue y revisa si ya hay trabajo empezado:
- Rama existente: `git branch -a | grep <LES-n>`
- PR existente: `gh pr list --search "<LES-n>" --state all --json number,title,url,isDraft,state,baseRefName`

Decide el punto de entrada:
- Nada existe → Paso 1.
- Rama con commits, sin PR, sin plan claro aprobado → retoma desde el Paso 3 usando el estado de la rama como contexto (no repitas preguntas ya respondidas si se pueden inferir de los commits).
- Rama con commits que ya implementan un plan claro, sin PR → Paso 6 (code review pre-PR).
- PR ya abierto sin el `/code-review` real corrido todavía → Paso 9.
- PR ya abierto y revisado, o ya aprobado/mergeado y solo falta dejar constancia → Paso 10.

Anuncia en una línea el punto de entrada elegido y por qué, antes de continuar.

### Paso 1 — Leer el issue

`mcp__linear-server__get_issue({ id: "<LES-n>" })` + `mcp__linear-server__list_comments({ issueId: "<LES-n>" })` para contexto adicional. Si `get_issue` señala relaciones (bloqueadores, duplicados), tráelas también con `includeRelations: true`.

### Paso 2 — Calibrar el rigor del proceso

Antes de seguir, clasifica el issue:
- **Pequeño y mecánico** (un archivo o cambio bien especificado, sin decisiones de arquitectura, sin ambigüedad real de alcance): salta las preguntas de aclaración y el checkpoint de plan (Pasos 3 y 4) — ve directo al Paso 5, avisando en una línea qué vas a hacer.
- **Multi-archivo o con decisiones de diseño/arquitectura reales**: sigue el flujo completo (Pasos 3 y 4).

Si tienes dudas sobre en qué categoría cae, trátalo como el caso grande. Esto no exime de preguntar si aparece una ambigüedad puntual real (ej. una inconsistencia en el propio issue) aunque el cambio en sí sea chico — eso se pregunta siempre, sin importar el tamaño.

### Paso 3 — Checkpoint: preguntas de aclaración

Solo si el Paso 2 lo marcó como no-trivial. Detecta qué falta para proponer un plan con confianza — alcance ambiguo, varias interpretaciones válidas, criterios de aceptación incompletos, dependencias no resueltas. Usa `AskUserQuestion`.

Si el issue ya es completamente claro, dilo explícitamente y no preguntes por preguntar.

### Paso 4 — Checkpoint: proponer el plan

Solo si el Paso 2 lo marcó como no-trivial. Si conviene explorar el código antes de proponer el plan, hazlo — no adivines rutas de archivo ni reinventes utilidades que ya existen en el repo.

Formato (regla global de `CLAUDE.md`):
```
1. [Paso] → verificar: [check]
2. [Paso] → verificar: [check]
```

Espera aprobación explícita del usuario antes de tocar código. Si pide cambios, ajusta y vuelve a preguntar.

### Paso 5 — Implementar

Antes de tocar código, crea la rama desde `main` con la convención de `AGENTS.md`: `git checkout -b {type}/LES-{n}-{descripcion-en-kebab-case}` (`{type}` = `feat|fix|refactor|chore|docs`). Si ya existe rama para este issue (Paso 0), reusa esa en vez de crear una nueva.

Implementa siguiendo las convenciones de `AGENTS.md`: Server Components por defecto, Zod en toda Server Action nueva, singleton de Prisma (`lib/prisma.ts`), tokens semánticos de Tailwind (nunca `tailwind.config.js`), `getAppUrl()` para cualquier URL absoluta. Si el cambio toca `prisma/schema.prisma`, usa la skill `/db` para generar la migración — nunca `prisma db push`.

Para cambios de UI, valida el flujo real en `bun dev` antes de dar el paso por terminado (regla global de `CLAUDE.md`).

Si aparece una desviación real del plan aprobado (algo no contemplado, un cambio de alcance), avísale al usuario — no la asumas en silencio como si fuera parte del plan original.

### Paso 6 — Code review pre-PR

`/code-review` está pensada para revisar un PR ya abierto en GitHub (usa `gh`, comenta ahí) — todavía no existe en este punto del flujo, se crea recién en el Paso 8. No la invoques acá.

Corre `/review-conexory` (invariantes propios del proyecto) sobre el diff local, y además hacé vos mismo una pasada de correctness genérica sobre el mismo diff (equivalente en espíritu a lo que haría `/code-review`, pero manual: bugs obvios, casos borde, nada específico de Conexory).

Resuelve los hallazgos bloqueantes antes de seguir (con el mismo criterio de avisar antes de aplicar cambios no triviales). Las sugerencias menores, decídelas con el usuario: ahora o quedan para después.

### Paso 7 — Checkpoint: revisión manual del usuario

El code review automatizado (Paso 6) no reemplaza que el usuario revise el código él mismo. Avísale que el diff está listo para su propia revisión y espera su aprobación explícita antes de seguir al Paso 8 — no asumas que pasar el Paso 6 sin hallazgos bloqueantes equivale a esta aprobación, son dos checkpoints distintos.

Si el usuario pide cambios, ajusta y vuelve a esperar su aprobación antes de continuar.

### Paso 8 — PR: commit, checks, descripción y creación

Sigue la skill `/create-pr` completa: valida/crea la rama, agrupa los cambios en commits siguiendo las convenciones del proyecto, corre en local lo mismo que CI (`bun install --frozen-lockfile`, `bunx prisma generate`, `bun typecheck`, `bun lint`), redacta la descripción del PR con la plantilla de `.github/pull_request_template.md` a partir del diff real.

Muéstrale al usuario la descripción propuesta (título + body) **antes** de crear el PR y espera su aprobación — es un checkpoint, no una formalidad. Recién después pushea y crea el PR.

Muestra la URL del PR al usuario.

### Paso 9 — Code review post-PR

`/code-review` (el multi-agente real: 5 agentes Sonnet en paralelo + scoring, comenta directamente en el PR de GitHub) es caro en tiempo y tokens — cada corrida completa puede tardar varios minutos y consumir cientos de miles de tokens. Escala este paso con el mismo criterio del Paso 2:

- **Si el Paso 2 clasificó el cambio como pequeño y mecánico:** saltea este paso — la revisión manual del Paso 6 ya alcanza. Dilo en una línea y avanza al Paso 10.
- **Si el Paso 2 lo marcó como multi-archivo o con decisiones de diseño reales:** corre `/code-review` sobre el PR ya abierto — recién acá tiene un PR sobre el que operar.

Si en cualquier punto el usuario pide cortar la corrida (por costo, tiempo, o porque no lo justifica), usar `TaskStop` sobre los agentes en vuelo en vez de dejarlos terminar, y no comentar en el PR con resultados parciales.

Resuelve los hallazgos bloqueantes que reporte, con el mismo criterio de avisar antes de aplicar cambios no triviales; si hay que pushear un fix, es un commit nuevo sobre la misma rama, no un amend.

### Paso 10 — Actualizar el vault y el issue de Linear

1. Actualiza el diario de desarrollo del vault: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Esteban/01-projects/conexory/diario-desarrollo/2026/<YYYYMM>-desarrollo-conexory.md` — agrega un bullet bajo el encabezado del día de hoy (`### D NombreDía`) describiendo qué se hizo, en qué rama/PR, y decisiones o gotchas relevantes, en el mismo tono narrativo (español, primera persona, pasado) que las entradas existentes. Si el mes no existe todavía, créalo y enlázalo desde `diario-desarrollo/desarrollo-conexory.md`.
2. Si el cambio es significativo (nueva feature, decisión de producto o arquitectura — no un fix menor), actualiza también `01-projects/conexory/conexory.md`: `en_progreso`, `Notas`, progreso de `milestones` si corresponde.
3. Actualiza el estado del issue en Linear (`mcp__linear-server__save_issue`) al estado que corresponda del flujo del equipo (ej. "In Review") y deja el link del PR como comentario o link attachment.

### Paso 11 — Reflexión sobre la skill

Antes de cerrar, repasa cómo salió el proceso en esta corrida: fricción real, pasos redundantes, algo que debiste preguntar y no preguntaste, un paso que se pudo saltar o que en realidad necesitaba más rigor del que tuvo, información que faltó. Si encuentras algo concreto y accionable, pregúntale al usuario si quiere que ajustes esta skill (`.claude/commands/dev-issue.md`) antes de terminar — no la edites sin preguntar. Si no hay nada relevante, no digas nada al respecto.

### Paso 12 — Cierre

Resume en 2-3 líneas qué se hizo y en qué quedó: estado del PR (abierto/mergeado), si el vault quedó actualizado, y el estado final del issue en Linear.
