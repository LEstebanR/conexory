# MiAgente — Guía para agentes de IA

## Advertencia crítica: Next.js 16

Esta app usa **Next.js 16.2.6** — una versión con breaking changes respecto a 15.x. Antes de escribir cualquier código relacionado con routing, metadata, headers o caché, lee el guide relevante en `node_modules/next/dist/docs/`. No asumas comportamiento de versiones anteriores.

Cambios clave ya presentes en este proyecto:
- `headers()`, `cookies()`, `params` y `searchParams` son **Promises** — siempre usar `await`
- El turbopack es el bundler por defecto en dev (`next dev` sin flags)

---

## Qué es este proyecto

**MiAgente** (`miagente.co`) es un SaaS para agentes inmobiliarios en Colombia. Permite crear fichas de propiedades, obtener un link único por propiedad y compartirlas por WhatsApp con preview enriquecida (OG image). El agente no necesita saber de tecnología — flujo completo en menos de 60 segundos.

**Mercado objetivo:** agentes inmobiliarios independientes en Colombia.  
**Modelo de negocio:** Freemium — plan gratuito (3 propiedades) + plan Pro ($99.999 COP/mes). **Ambos planes con la pasarela de pagos funcional son parte del MVP.**

---

## Stack completo

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 |
| UI | React | 19.2.4 |
| Lenguaje | TypeScript | 5 |
| Estilos | Tailwind CSS | 4 |
| Componentes | Radix UI + Lucide React | — |
| Auth | better-auth | 1.6.13 |
| ORM | Prisma | 5 |
| Base de datos | PostgreSQL (Neon serverless) | — |
| Almacenamiento | Vercel Blob | 2.4.0 |
| Blog | Markdown con gray-matter + marked | — |
| Notificaciones | Sonner (toasts) | 2.0.7 |
| Package manager | Bun | — |
| Deploy | Vercel | — |

---

## Estructura del proyecto

```
app/
  page.tsx                          # Landing pública (redirige a /dashboard si hay sesión)
  layout.tsx                        # Root layout con metadata global
  globals.css                       # Variables CSS, tokens brand-*, reset
  blog/
    page.tsx                        # Listado de posts
    [slug]/page.tsx                 # Post individual
  contacto/page.tsx
  cookies/page.tsx
  precios/page.tsx                  # Planes Free y Pro
  privacy/page.tsx
  roadmap/page.tsx                  # Roadmap público
  terms/page.tsx
  login/page.tsx
  register/page.tsx
  p/[slug]/page.tsx                 # Vista pública de propiedad (sin login)
  dashboard/
    layout.tsx                      # Layout con sidebar
    page.tsx                        # Listado de propiedades del agente + stats
    properties/
      new/
        page.tsx                    # Formulario nueva propiedad (Client Component)
        actions.ts                  # Server Action: createProperty
        image-upload.tsx            # Subida a Vercel Blob
      [id]/
        page.tsx                    # Detalle de propiedad en dashboard
        actions.ts                  # Server Action: deleteProperty, togglePublished
        edit/
          page.tsx
          edit-form.tsx
          actions.ts                # Server Action: updateProperty
        property-actions.tsx        # Botones de acción (Client Component)
        share-panel.tsx             # Panel de compartir WhatsApp
  api/
    auth/[...all]/route.ts          # Handler de better-auth
    upload/route.ts                 # Handler para Vercel Blob
components/
  dashboard/sidebar.tsx
  features.tsx
  footer.tsx
  hero.tsx
  how-it-works.tsx
  image-upload.tsx                  # Componente reutilizable de subida de fotos
  legal-layout.tsx
  navbar.tsx
  property-carousel.tsx
  property-preview.tsx
  signup-cta.tsx
  stats.tsx
  ui/
    badge.tsx
    button.tsx
    input.tsx
lib/
  auth.ts                           # Configuración de better-auth (servidor)
  auth-client.ts                    # Cliente de better-auth (navegador)
  blog.ts                           # Utilidades para leer posts Markdown
  prisma.ts                         # Singleton de PrismaClient
  utils.ts                          # cn() y helpers
content/blog/                       # Posts en Markdown (frontmatter: title, date, description, slug)
prisma/schema.prisma                # Esquema de base de datos
```

---

## Base de datos (Prisma schema)

### Modelos principales

**`User`** — agente inmobiliario
- `id`, `name`, `email` (unique), `emailVerified` (default false), `image?`
- Relación: `properties Property[]`

**`Property`** — ficha de propiedad
- `id`, `userId`, `title`, `slug` (unique), `type`, `price` (Decimal 15,2)
- `city`, `neighborhood?`, `area?` (Float), `bedrooms?`, `bathrooms?`, `parking?`
- `description?`, `images` (String[]), `shares` (Int default 0)
- `published` (Bool default true), `createdAt`, `updatedAt`

**Tablas de auth:** `Session`, `Account`, `Verification` (requeridas por better-auth)

### Tipos de propiedad válidos

`apartment` | `house` | `office` | `commercial` | `lot` | `warehouse`

### Convenciones Prisma

- Siempre usar `prisma` desde `lib/prisma.ts` (singleton con `globalThis`)
- El precio se guarda como `Decimal` — llamar `.toNumber()` para operaciones JS
- `onDelete: Cascade` en todas las relaciones de `User`

---

## Autenticación (better-auth)

- **Métodos:** email/password + Google OAuth
- **Account linking habilitado** — un usuario puede tener email y Google vinculados
- **Sesión:** expira en 7 días, se renueva si tiene más de 1 día, cookie cacheada 5 min
- **Obtener sesión en Server Component:**
  ```ts
  const session = await auth.api.getSession({ headers: await headers() })
  ```
- **Proteger rutas:** redirigir a `/login` si no hay sesión, a `/dashboard` si ya la hay
- `emailVerified` existe en el schema pero **no se valida actualmente**

---

## Patrones y convenciones

### Server Actions

- Cada ruta de escritura tiene su `actions.ts` en la misma carpeta que la página
- Las acciones son `async function` exportadas con `"use server"`
- Actualmente **sin validación Zod** — no replicar este patrón en código nuevo, todo código nuevo debe validar con Zod

### Componentes

- **Server Components** por defecto — solo usar `"use client"` cuando sea estrictamente necesario (interactividad, hooks, eventos del browser)
- El formulario de nueva/edición de propiedad es Client Component por la complejidad del estado local
- Componentes de UI atómicos en `components/ui/` — preferir extender estos antes de crear nuevos

### Estilos (Tailwind CSS 4)

- Colores de marca: `brand-50` hasta `brand-950` (definidos en `globals.css`)
- Paleta principal del UI: `slate-*` para neutros, `brand-*` para acciones y highlights
- **No usar `tailwind.config.js`** — la config en Tailwind 4 va en el CSS vía `@theme`
- Clases utilitarias de composición: usar `cn()` de `lib/utils.ts` (clsx + tailwind-merge)

### Imágenes de propiedades

- Se suben a **Vercel Blob** vía `POST /api/upload`
- Se guardan como array de URLs en `Property.images`
- Límite plan gratuito: 10 fotos por propiedad

### Blog

- Posts en `content/blog/*.md` con frontmatter: `title`, `date`, `slug`, `description`
- Funciones de lectura en `lib/blog.ts`
- Renderizado con `marked` (HTML desde Markdown)

---

## Variables de entorno

Ver `.env.example` para la lista completa. Las críticas:

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión pooled a Neon (para Prisma en edge/serverless) |
| `DIRECT_URL` | Conexión directa a Neon (para migraciones) |
| `BETTER_AUTH_SECRET` | Firma de sesiones |
| `BETTER_AUTH_URL` | URL base de la app |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob |

---

## Comandos de desarrollo

```bash
bun dev          # Inicia el servidor de desarrollo
bun build        # prisma generate + next build
bun lint         # ESLint
bunx prisma migrate dev   # Nueva migración
bunx prisma studio        # GUI de la base de datos
```

---

## Convenciones Git

### Nombres de rama

```
{type}/LES-{número}-{descripción-corta}
```

| Parte | Valores válidos |
|---|---|
| `type` | `feat` · `fix` · `refactor` · `chore` · `docs` |
| `LES-{número}` | ID del issue de Linear que origina el cambio |
| `descripción-corta` | kebab-case, máximo 5 palabras, en inglés |

**Ejemplos correctos:**
```
feat/LES-149-plan-pro-subscriptions
fix/LES-155-zod-validation-actions
chore/LES-156-custom-404-page
refactor/LES-154-listing-type-field
```

El workflow `.github/workflows/branch-name.yml` valida este formato en cada PR y falla si no se cumple.

### Pull Requests

**Título:** `{type}(LES-{número}): descripción corta en imperativo`

```
feat(LES-149): add Pro plan subscription flow with Wompi
fix(LES-155): validate property input with Zod in server actions
```

**Descripción:** usar la plantilla en `.github/pull_request_template.md`. Siempre incluir:
- Qué hace el PR (1-3 oraciones)
- Link al issue de Linear (`Closes:`)
- Pasos para probarlo
- Checklist de build, tipos y migraciones

---

## Qué NO hacer

- No usar `tailwind.config.js` — la configuración va en `globals.css`
- No crear Server Actions sin validar entrada (usar Zod)
- No olvidar `await` en `headers()`, `cookies()` y `params`/`searchParams` (son Promises en Next.js 16)
- No hardcodear `"En venta"` — las propiedades pueden ser en arriendo o en venta/arriendo
- No exponer `userId` en rutas públicas — la vista pública `/p/[slug]` no debe filtrar datos del agente
