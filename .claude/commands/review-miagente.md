# /review-miagente

Code-review **específico de MiAgente**: revisa el diff contra los invariantes y gotchas propios de este proyecto. No reemplaza a `/code-review` (que caza bugs de correctness genéricos) — esto verifica las reglas que solo aplican aquí. Lo ideal es correr ambos.

No apliques cambios; reporta hallazgos. Cada uno con `archivo:línea`, qué regla del proyecto viola y el impacto concreto.

---

## Paso 0 — Reúne el diff

```bash
git diff main...HEAD          # rango del PR
git diff HEAD                 # cambios sin commitear (si los hay, inclúyelos)
```

Si te pasan un PR/rama/archivo como argumento, revisa ese objetivo. Para cada hunk, lee también la función que lo rodea (un bug en una línea no tocada de una función modificada está en alcance).

---

## Paso 1 — Verifica los invariantes del proyecto

Recorre el diff buscando violaciones de **cada** categoría. Marca solo lo que el diff realmente introduce o re-expone.

### 1. Next.js 16 — APIs asíncronas (el gotcha #1)
`headers()`, `cookies()`, `params` y `searchParams` son **Promises**. Falta de `await` = bug.
- ❌ `const { id } = params` / `headers()` sin `await` → `cookies()`, etc.
- ✅ `const { id } = await params`, `await headers()`, `auth.api.getSession({ headers: await headers() })`.
- Revisa también que no se asuma comportamiento de Next 15 en routing, metadata o caché.

### 2. Server Actions — validación con Zod obligatoria
Toda action de escritura (`"use server"`) debe validar su input con un schema de Zod (en `lib/validations/`), **antes** de tocar la BD.
- ❌ Action nueva que usa `data.x` directo sin `safeParse`.
- ✅ `const parsed = Schema.safeParse(data); if (!parsed.success) return { success: false, error: ... }`.
- Verifica que se devuelva el patrón de resultado discriminado (`{ success: true ... } | { success: false; error }`) en vez de lanzar errores crudos al cliente.

### 3. Rutas públicas — no filtrar datos del agente
La vista pública `/p/[slug]` (y cualquier ruta sin login) **no debe exponer `userId`** ni datos privados del agente.
- ❌ `select` que incluye `userId`, email del agente, o pasa el objeto `user` completo al cliente.
- ✅ Solo los campos de la propiedad necesarios para el render público.

### 4. Prisma
- ❌ Instanciar `new PrismaClient()` — usar siempre el singleton de `lib/prisma.ts`.
- ❌ Operar el `price` como número sin convertir — es `Decimal(15,2)`, usar `.toNumber()`.
- ✅ `onDelete: Cascade` en relaciones nuevas de `User`.
- **Cambio de schema sin migración** = bug: si el diff toca `prisma/schema.prisma`, debe incluir la migración en `prisma/migrations/` (ver `/db`). Nunca `db push`.

### 5. Tailwind CSS 4
- ❌ Crear o editar `tailwind.config.js` — la config va en `globals.css` vía `@theme`.
- ❌ Colores hardcodeados fuera de la paleta — usar tokens `brand-*` (acciones/highlights) y `slate-*` (neutros).
- ✅ Composición de clases con `cn()` de `lib/utils.ts`.

### 6. Server vs Client Components
- ❌ `"use client"` innecesario (sin hooks, eventos ni interactividad real) — Server Component por defecto.
- Si un componente nuevo es client solo por un detalle, evalúa si ese detalle puede aislarse.

### 7. Dominio inmobiliario
- ❌ Hardcodear `"En venta"` — una propiedad puede ser en arriendo o venta. Usar el campo/tipo correspondiente.
- ❌ Texto de UI en inglés — el mercado es Colombia; strings visibles al usuario en **español**.
- Tipos de propiedad válidos: `apartment | house | office | commercial | lot | warehouse`. Cualquier otro string es inválido.

### 8. Planes y límites
No hay sistema de planes activo: los límites (3 propiedades, 10 fotos por propiedad) aplican a **todos** como constantes del plan free.
- ❌ Lógica que asuma un plan Pro funcional o checks de suscripción inexistentes.
- ✅ Límites como constantes, no condicionados a un plan que aún no existe.

### 9. Imágenes
- Se suben a Vercel Blob vía `POST /api/upload` y se guardan como array de URLs en `Property.images`.
- ❌ Usar `<img>` en vez de `next/image` (CI/ESLint lo marca como error).
- Respetar el límite de 10 fotos.

### 10. Auth
- ✅ Sesión vía `auth.api.getSession({ headers: await headers() })`.
- ✅ Proteger rutas: redirigir a `/login` si no hay sesión, a `/dashboard` si ya la hay.
- Nota: `emailVerified` existe pero **no se valida** actualmente — no construyas lógica que asuma que sí.

### 11. Variables de entorno
- Si el diff introduce una env var nueva, debe estar documentada en `.env.example`.
- ❌ Hardcodear secretos o URLs que deberían ser env vars.

---

## Paso 2 — Reporta

Lista los hallazgos, **primero los más severos** (correctness/seguridad > convención > estilo). Para cada uno:

```
[categoría] archivo:línea
  Regla: (qué invariante del proyecto viola)
  Impacto: (qué se rompe concretamente — crash, fuga de datos, fallo de CI, deuda)
  Fix: (la corrección concreta)
```

Si no hay violaciones de proyecto, dilo claramente y recuerda correr `/code-review` para la pasada de correctness genérica. Si encuentras bugs de correctness que no son específicos del proyecto, menciónalos pero aclara que `/code-review` es la herramienta indicada para esa capa.
