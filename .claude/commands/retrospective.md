# /retrospective

Eres un agente de síntesis y memoria. Tu única misión es estudiar la sesión actual, extraer lo que vale la pena retener a largo plazo, y actualizar los archivos de Claude que correspondan. No hagas nada más.

---

## Paso 1 — Lee el estado actual de la memoria

Lee estos archivos antes de hacer cualquier cambio:

```
.claude/memory/MEMORY.md
.claude/memory/project_miagente.md
.claude/memory/reference_linear.md
.claude/memory/user_profile.md
.claude/memory/feedback_general.md
```

Si alguno no existe, créalo desde cero con la estructura correcta (ver sección "Esquema de archivos" más abajo).

---

## Paso 2 — Estudia la sesión actual

Revisa toda la conversación de esta sesión. Para cada intercambio, pregúntate:

**¿Qué aprendí del usuario?**
- ¿Cambió alguna preferencia sobre cómo quiere que trabaje con él?
- ¿Corrigió algún comportamiento mío? ("no hagas X", "prefiero Y")
- ¿Confirmó algún enfoque? ("perfecto", "exactamente así", aceptó sin pushback)
- ¿Mostró expertise en algún tema nuevo?

**¿Qué aprendí del proyecto?**
- ¿Cambiaron los objetivos, el alcance o las prioridades?
- ¿Se tomaron decisiones arquitectónicas o de producto?
- ¿Se actualizó el roadmap o los milestones?
- ¿Hay nuevos constraints (técnicos, de negocio, de fechas)?

**¿Qué cambió en las referencias externas?**
- ¿Se crearon o modificaron issues en Linear?
- ¿Hay nuevas URLs, proyectos o recursos externos relevantes?

**¿Qué NO vale la pena guardar?**
- Código que ya está en el repo
- Detalles de implementación que se derivan del código
- Contexto efímero de la sesión sin valor futuro
- Cosas ya documentadas en CLAUDE.md / AGENTS.md

---

## Paso 3 — Decide qué actualizar

Para cada hallazgo, determina el archivo correcto:

| Tipo de hallazgo | Archivo |
|---|---|
| Preferencia o corrección de comportamiento | `.claude/memory/feedback_general.md` |
| Perfil, expertise, contexto del usuario | `.claude/memory/user_profile.md` |
| Estado del proyecto, decisiones, prioridades | `.claude/memory/project_miagente.md` |
| Referencias a sistemas externos (Linear, Vercel, etc.) | `.claude/memory/reference_linear.md` |
| Nueva convención de código o arquitectura establecida | `AGENTS.md` |

**Regla de oro:** Si el hallazgo no cambiaría cómo me comportaré en una sesión futura, no lo guardes.

---

## Paso 4 — Aplica los cambios

Para cada archivo a modificar:

1. Léelo primero si no lo has leído ya
2. Edita solo las secciones afectadas (no reescribas lo que no cambió)
3. Si creas un archivo nuevo, agrégalo al índice `.claude/memory/MEMORY.md`
4. Si modificas `AGENTS.md`, asegúrate de que los cambios sean reglas generalizables, no detalles de la sesión

---

## Paso 5 — Muestra el reporte

Al terminar, muestra este resumen:

```
🔁 RETROSPECTIVA — [fecha de hoy]

ARCHIVOS ACTUALIZADOS
  - [nombre-archivo.md]: [qué cambió en 1 línea]
  - ...

APRENDIZAJES CLAVE
  - [lista de 3-7 bullets con lo más importante extraído]

SIN CAMBIOS (y por qué)
  - [cosas que podrían parecer importantes pero no se guardaron, con razón]
```

Si no hay nada relevante que guardar, dilo directamente: "Sesión sin aprendizajes nuevos para persistir."

---

## Esquema canónico de archivos

```
.claude/
  commands/
    retrospective.md          ← esta skill
  memory/
    MEMORY.md                 ← índice de todos los archivos
    feedback_general.md       ← correcciones y preferencias de comportamiento
    project_miagente.md       ← estado del proyecto, stack, decisiones
    reference_linear.md       ← Linear: IDs, cómo consultar issues
```

### `MEMORY.md` — índice
```markdown
# Memory Index

- [Feedback general](feedback_general.md) — correcciones y preferencias de comportamiento
- [Proyecto MiAgente](project_miagente.md) — estado del proyecto, stack, decisiones
- [Linear — miAgente](reference_linear.md) — workspace, IDs, cómo consultar issues
```

### `feedback_general.md`
```markdown
---
name: feedback-general
description: Correcciones y preferencias de Luis sobre cómo debe comportarse Claude en este proyecto
metadata:
  type: feedback
---

[contenido]
```

### `project_miagente.md`
```markdown
---
name: project-miagente
description: Estado del proyecto MiAgente — stack, decisiones, prioridades actuales
metadata:
  type: project
---

[contenido]
```

### `reference_linear.md`
```markdown
---
name: reference-linear-miagente
description: Linear workspace de Luis — IDs de proyecto, equipo, milestones
metadata:
  type: reference
---

[contenido]
```
