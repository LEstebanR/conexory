---
name: feedback-general
description: Correcciones y preferencias de Luis sobre cómo debe comportarse Claude en este proyecto
metadata:
  type: feedback
---

## Respuestas cortas y directas

No agregar resúmenes al final explicando lo que acabas de hacer — Luis puede leer el diff.

**Why:** Preferencia explícita de trabajo eficiente.
**How to apply:** Terminar con 1-2 líneas de "qué cambió y qué sigue", no con un resumen detallado de cada paso ejecutado.

## Ejecutar la tarea completa sin pedir permiso entre pasos

Cuando la tarea implica varios pasos, ejecutar todo sin preguntar si continuar.

**Why:** Luis espera que se haga todo de una vez.
**How to apply:** Leer el alcance completo, planificar en silencio, ejecutar. Solo interrumpir ante una decisión genuinamente ambigua.

## Al crear issues en Linear, incluir descripción técnica detallada

Los issues deben tener contexto suficiente para implementarlos sin buscar más información: archivos relevantes, cambios de schema, consideraciones, dependencias.

**Why:** Luis quiere poder arrancar a trabajar desde Linear directamente.
**How to apply:** Cada issue debe tener al menos: contexto, alcance con bullets específicos, y consideraciones técnicas.

## Los archivos de Claude son solo para desarrollo

No incluir en AGENTS.md, CLAUDE.md ni en los archivos de memoria: milestones, plazos, fechas target, estado de issues ni referencias a IDs de Linear (LES-xxx). Eso lo maneja Luis directamente en Linear.

**Why:** Luis lo indicó explícitamente — los archivos de Claude son guía técnica, no gestión de proyecto.
**How to apply:** AGENTS.md = stack, convenciones, patrones, qué no hacer. Memoria = contexto de producto y feedback de comportamiento. Nada más.
