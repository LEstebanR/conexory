---
description: Crea un issue bien formado en GitHub Issues para Conexory, usando la plantilla del proyecto y labels consistentes con la convención de tipos y prioridad.
argument-hint: [descripción libre del issue]
---

# Crear issue en GitHub

Crea un issue en GitHub Issues (`LEstebanR/conexory`) siguiendo la plantilla del proyecto (`.github/ISSUE_TEMPLATE/tarea.md`). Este es el flujo de tracking para issues que gestiona Luis directamente — Linear sigue existiendo para issues previos y para lo que gestione su socio, pero no es la fuente de este comando (ver "Tracking de trabajo" en `AGENTS.md`).

Usa `$ARGUMENTS` como punto de partida del issue (título/descripción libre). Si viene vacío o muy incompleto, pregunta.

## Guard

Verifica el repo: `gh repo view --json nameWithOwner --jq .nameWithOwner` debe devolver `LEstebanR/conexory`. Si no, avisa que este comando es específico de Conexory y aborta.

## Paso 1 — Reunir la información

A partir de `$ARGUMENTS` y del contexto de la conversación, identifica:

- **Título**: corto, en imperativo o sustantivo claro (igual que un título de PR, sin prefijo de tipo).
- **Contexto**: por qué hace falta esto — qué problema resuelve o qué lo motiva. Si no es evidente, pregúntalo antes de inventarlo (regla global de `CLAUDE.md`: no asumas alcance ni motivación no respaldada).
- **Qué hay que hacer**: alcance concreto.
- **Criterios de aceptación**: cómo se sabe que está terminado. Si el usuario no los da explícitamente, propón un borrador a partir del contexto y dile que los ajuste — no los des por buenos en silencio si son una suposición tuya.
- **Notas técnicas** (opcional): decisiones de diseño, archivos relevantes, alternativas descartadas, si ya se discutieron en la conversación.

No preguntes por preguntar: si la conversación ya tiene todo esto (p. ej. viene de una investigación o discusión previa), redacta el borrador directamente y pasa al Paso 2.

## Paso 2 — Clasificar tipo y prioridad

**Tipo** (determina el label, mapeo fijo — no inventes labels nuevos):

| Naturaleza del issue | Label |
|---|---|
| Nueva funcionalidad | `enhancement` |
| Bug / algo roto | `bug` |
| Reorganización sin cambio de comportamiento | `refactor` |
| Config, dependencias, infraestructura, migraciones de proveedor | `chore` |
| Documentación | `documentation` |

Si el issue abarca más de un tipo (p. ej. una migración grande que después se partirá en varios PRs de distinto `{type}`), usa el label que mejor describa el issue **como iniciativa completa**, y dilo explícitamente en "Notas técnicas".

**Prioridad** — aplica uno de `priority: alta` / `priority: media` / `priority: baja`. Si no es obvio por el contexto (p. ej. algo bloqueando a un usuario real vs. mejora de fondo), pregúntale a Luis en vez de asumir.

## Paso 3 — Checkpoint: mostrar el borrador

Muestra el título, body completo (con la estructura de la plantilla) y los labels elegidos **antes** de crear el issue. Espera aprobación explícita — igual que el checkpoint de descripción de PR en `/create-pr`. Si pide cambios, ajusta y vuelve a mostrar.

## Paso 4 — Crear el issue

```bash
gh issue create \
  --repo LEstebanR/conexory \
  --title "<título>" \
  --label "<tipo>,priority: <prioridad>" \
  --body "$(cat <<'EOF'
## Contexto

<contexto>

## Qué hay que hacer

<alcance>

## Criterios de aceptación

- [ ] <criterio 1>
- [ ] <criterio 2>

## Notas técnicas

<notas, si aplica — omitir la sección si no hay nada>
EOF
)"
```

## Paso 5 — Reportar

Devuelve el número y URL del issue creado. Recuerda en una línea que, al empezar a trabajarlo, la rama va **sin número** (`{type}/{descripción-corta}`, ver `AGENTS.md`) y el PR debe llevar `Closes #<número>` para que se cierre solo al mergear.
