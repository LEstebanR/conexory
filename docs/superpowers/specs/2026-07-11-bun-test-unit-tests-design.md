# Configurar bun:test y agregar la primera tanda de pruebas unitarias

**Issue:** [LES-159](https://linear.app/lesteban/issue/LES-159/configurar-vitest-y-agregar-pruebas-unitarias)
**Fecha:** 2026-07-11

## Contexto

El proyecto no tiene ninguna suite de pruebas. LES-159 (creado en junio) ya proponía Vitest y una primera lista de qué testear, pero desde entonces el código cambió (Zod ya está integrado en `PropertySchema`, aparecieron varias funciones puras nuevas en `lib/`). Esta spec actualiza esa propuesta al estado actual del repo y decide el runner.

El objetivo de esta tanda es chico a propósito: arrancar la suite con tests pequeños sobre funciones puras y dejar correr `bun test` en CI en cada PR. Subir la cobertura a 100% y cubrir rutas con mocks (auth, Prisma, Vercel Blob) queda en issues separados (ver "Fuera de alcance").

## Decisiones

### Test runner: `bun:test`

El proyecto ya usa Bun para todo el toolchain (dev, build, lint, package manager). Bun trae un test runner nativo con API compatible con Jest (`import { test, expect } from "bun:test"`), por lo que no hace falta agregar Vitest ni sus dependencias (`vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`). Se descarta la propuesta original del issue por esta razón.

### Convención de archivos

Los tests se colocan junto al archivo que prueban (`lib/utils.test.ts` junto a `lib/utils.ts`), siguiendo el mismo patrón de colocación que ya usa el proyecto para `actions.ts`. `bun test` encuentra `*.test.ts` automáticamente sin configuración adicional.

### Script de package.json

```json
"test": "bun test"
```

No se agrega `bunfig.toml` en esta tanda — no hace falta configuración adicional para tests de funciones puras, y la config de coverage queda para LES-237.

## Alcance: archivos de test

Todos son funciones puras, sin mocks de red, sesión o base de datos.

| Archivo | Qué cubre |
|---|---|
| `lib/utils.test.ts` | `cn()` — combina clases, resuelve conflictos de Tailwind (`p-2 p-4` → `p-4`), maneja valores falsy |
| `lib/urls.test.ts` | `getAppUrl()` — precedencia `APP_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `localhost:3000`; que `""` se trate como ausente (no como valor válido) |
| `lib/format.test.ts` | `formatCOP`, `formatCOPMillionsValue`, `formatCOPMillions` — formato es-CO, redondeo a millones sin decimales |
| `lib/youtube.test.ts` | `youtubeId` (los 5 patrones: watch, youtu.be, embed, shorts, live), `isYoutubeUrl`, `youtubeEmbedUrl`, `youtubeThumb` |
| `lib/plans.test.ts` | `propertyLimit`, `photoLimit` — valores Free vs Pro |
| `lib/blog.test.ts` | `getAllPosts` (orden por fecha, defaults para campos de frontmatter faltantes), `getRelatedPosts` (ranking por tags compartidos, excluye el propio slug) — lee `content/blog/*.md` reales del repo, sin mocks de filesystem |
| `lib/validations/property.test.ts` | `PropertySchema.safeParse` — casos válidos e inválidos: título vacío/muy largo, precio negativo o no numérico, tipo/transactionType inválido, exceso de fotos sobre `PRO_PHOTO_LIMIT`, `videoUrl` que no es de YouTube, coerción de campos numéricos opcionales (`""` → `null`) |

## Fuera de alcance (issues separados)

- **[LES-236](https://linear.app/lesteban/issue/LES-236)** — tests que requieren mocks (`app/api/upload/route.ts`, Server Actions con Prisma como `createProperty`). Se dejan fuera para no mezclar el patrón de mocks con esta tanda inicial, que debe ser rápida de escribir y revisar.
- **[LES-237](https://linear.app/lesteban/issue/LES-237)** — subir cobertura a 100% con `bun test --coverage` y bloquear PRs por debajo del umbral. Requiere que LES-236 esté resuelto primero para tener cobertura real de las rutas con mocks.

## CI

Agregar un job `test` a `.github/workflows/ci.yml`, paralelo a `typecheck` y `lint`:

```yaml
test:
  name: Test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: oven-sh/setup-bun@v2
    - run: bun install --frozen-lockfile
    - run: bun test
```

Sin `prisma generate`: ninguno de los módulos de esta tanda importa Prisma. Se agregará ese paso cuando LES-236 introduzca tests que sí lo necesiten.

## Branch protection

Requerir el check "Test" en la protección de `main` es una configuración de GitHub (no vive en código del repo). Queda como paso manual para el usuario al final de este trabajo, fuera del alcance de este PR.

## Validación

- `bun test` pasa localmente y en CI
- `bun typecheck` y `bun lint` se mantienen en verde (los archivos de test son TypeScript y deben cumplir las mismas reglas)
- No se toca ningún archivo de producción — esta tanda es estrictamente aditiva (nuevos `*.test.ts` + script + workflow)
