---
name: feedback-general
description: Correcciones y preferencias de Luis sobre cómo debe comportarse Claude en este proyecto
metadata:
  type: feedback
---

## Presentar un plan antes de ejecutar

Antes de hacer cualquier cambio, mostrar qué se va a hacer y por qué.

**Why:** Luis quiere poder anticipar el impacto de lo que se va a hacer antes de que ocurra.
**How to apply:** Listar los pasos o archivos que se van a tocar, con una línea de justificación por cada uno. No ejecutar hasta haber mostrado el plan. El plan no necesita aprobación explícita — si Luis no objeta, se procede.

## Explicar al final lo que se hizo

Al terminar una tarea, incluir un resumen de qué cambió y por qué.

**Why:** Luis quiere entender el resultado sin tener que inferirlo del diff.
**How to apply:** Cerrar cada respuesta con un resumen claro: qué archivos cambiaron, qué decisiones se tomaron y qué efecto tiene. Breve pero completo.

## Al crear issues en Linear, incluir descripción técnica detallada

Los issues deben tener contexto suficiente para implementarlos sin buscar más información: archivos relevantes, cambios de schema, consideraciones, dependencias.

**Why:** Luis quiere poder arrancar a trabajar desde Linear directamente.
**How to apply:** Cada issue debe tener al menos: contexto, alcance con bullets específicos, y consideraciones técnicas.

## Los estilos a nivel de componente van en el componente, no en CSS global

Si un estilo aplica a un elemento o componente concreto (p. ej. `cursor-pointer` en un botón), va en la definición de ese componente/clase, no como regla base en `globals.css`.

**Why:** Luis rechazó explícitamente meter una regla `button { cursor: pointer }` en `globals.css` — "ese estilo debe ir en la definición del componente".
**How to apply:** Resolver inconsistencias de estilo en el componente afectado (o en el componente UI base reutilizable, como `components/ui/button.tsx`), no con reglas globales/`@layer base`. Reservar `globals.css` para tokens y resets reales, no para parchear comportamiento de componentes.

## Los archivos de Claude son solo para desarrollo

No incluir en AGENTS.md, CLAUDE.md ni en los archivos de memoria: milestones, plazos, fechas target, estado de issues ni referencias a IDs de Linear (LES-xxx). Eso lo maneja Luis directamente en Linear.

**Why:** Luis lo indicó explícitamente — los archivos de Claude son guía técnica, no gestión de proyecto.
**How to apply:** AGENTS.md = stack, convenciones, patrones, qué no hacer. Memoria = contexto de producto y feedback de comportamiento. Nada más.
