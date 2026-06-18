# Conexory — Guía para agentes de IA

## Advertencia crítica: Next.js 16

Esta app usa **Next.js 16.2.6** — una versión con breaking changes respecto a 15.x. Antes de escribir cualquier código relacionado con routing, metadata, headers o caché, lee el guide relevante en `node_modules/next/dist/docs/`. No asumas comportamiento de versiones anteriores.

Cambios clave ya presentes en este proyecto:
- `headers()`, `cookies()`, `params` y `searchParams` son **Promises** — siempre usar `await`
- El turbopack es el bundler por defecto en dev (`next dev` sin flags)

---

## Qué es este proyecto

**Conexory** (`conexory.com`) es un SaaS para agentes inmobiliarios en Colombia. Permite crear fichas de propiedades, obtener un link único por propiedad y compartirlas por WhatsApp con preview enriquecida (OG image). El agente no necesita saber de tecnología — flujo completo en menos de 60 segundos.

**Mercado objetivo:** agentes inmobiliarios independientes en Colombia.  
**Modelo de negocio:** Freemium — Free (3 propiedades), Pro ($99.999 COP/mes, 50 propiedades) y Personalizado (por contacto). Detalle de límites por plan en la sección "Planes y límites". **La pasarela de pagos funcional es parte del MVP.**

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

### Migraciones

La base de datos está bajo control de **Prisma Migrations** (con migración `0_init` baselined). Para cualquier cambio de schema, generar una migración (`bunx prisma migrate dev`) y commitearla — **nunca usar `prisma db push`**, rompería el historial.

- `prisma migrate deploy` corre automáticamente en cada build de Vercel (está en el script `build`), así que las migraciones pendientes se aplican solas en cada deploy.
- Por eso los entornos *Preview/Development* de Vercel apuntan a una **base de desarrollo** separada (no a producción): así un preview deploy aplica la migración a dev, nunca a prod. Solo *Production* usa la base real. Al tocar `DATABASE_URL`/`DIRECT_URL` en Vercel, respetar ese scoping.

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
- **Email/password va por Server Actions**, no por llamadas client-side: `app/login/actions.ts` y `app/register/actions.ts` llaman `auth.api.signInEmail`/`signUpEmail`, validan con Zod y mapean `APIError` (`better-auth/api`). Los forms usan `useActionState` + `<form action>` para que el envío funcione por progressive enhancement (Enter envía sin depender de la hidratación). **Google OAuth sí es client-side** (`signIn.social`, flujo de redirect).
- **`nextCookies()` es el último plugin en `lib/auth.ts`** — es lo que permite que las Server Actions escriban la cookie de sesión vía `next/headers`. No reordenarlo ni quitarlo.

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

### Estilos (Tailwind CSS 4) — design system monocromo (Uber)

El sistema es **monocromo blanco/negro/grises**, inspirado en Uber (ver `DESIGN.md` en la raíz). **No hay segundo color de acento**: el negro es el único color de conversión.

- **Tokens semánticos** (definidos en `globals.css` vía `@theme`): `ink` (#000, texto y CTAs), `body` (#5e5e5e, texto secundario), `mute` (#afafaf, placeholders/fine print), `canvas` (#fff), `canvas-soft` (#efefef, chips/superficies suaves), `canvas-softer` (#f3f3f3), `surface-pressed`, `hairline`/`hairline-strong` (bordes), `elevated` (#282828, hover sobre negro). Úsalos como `bg-ink`, `text-body`, `border-hairline`, etc.
- **`brand-50…950` es ahora una rampa neutra de grises** anclada en negro (`brand-950` = #000). Existe para que el código legado degrade a grises; en código nuevo prefiere los tokens semánticos.
- **CTAs y acciones primarias siempre en negro** (`bg-ink`; el `Button` `default` ya lo es). Forma firma: **píldora** (`rounded-full`) en todo elemento interactivo. Tarjetas en `rounded-2xl`.
- **No introducir colores de acento** (verde, azul, etc.). El verde de WhatsApp (`#25D366`) solo se permite en contexto de producto real (botón de contacto en la app/vista pública), **nunca en la landing/marketing** — ahí los botones de WhatsApp van en negro.
- Estados de alerta/límite usan el token `warning-*` (escala ámbar en `@theme`) para la **superficie/aviso**, no para el botón. No hardcodear `amber-*`, `blue-*`, `violet-*` ni colores fuera de la paleta.
- **Animaciones de marketing**: `animate-fade-up`/`animate-fade-in` (entrada) y `animate-marquee`; el componente `components/reveal.tsx` aplica fade-up al entrar en viewport (respeta `prefers-reduced-motion`).
- **No usar `tailwind.config.js`** — la config en Tailwind 4 va en el CSS vía `@theme`
- Clases utilitarias de composición: usar `cn()` de `lib/utils.ts` (clsx + tailwind-merge)

### Imágenes de propiedades

- Se suben a **Vercel Blob** vía `POST /api/upload`
- Se guardan como array de URLs en `Property.images`
- Límite de fotos **por plan**: 10 (Free) / 20 (Pro). Vive en `lib/plans.ts` y se aplica server-side en las actions; el uploader (`components/image-upload.tsx`) recibe `maxImages` por prop.

### Planes y límites

- Tres planes: **Free** (3 propiedades activas, 10 fotos/propiedad), **Pro** (50 propiedades, 20 fotos/propiedad), **Personalizado** (equipos/agencias, por contacto, sin límite).
- El único flag de plan es `User.isPremium` (boolean), expuesto en la sesión — en server vía `getSession`, en client vía `useSession` (el auth-client usa `inferAdditionalFields` para tiparlo). No hay flag para "Personalizado": se gestiona por contacto.
- Los límites viven en `lib/plans.ts` (`propertyLimit()` / `photoLimit()`) — **fuente única de verdad**. Nunca hardcodear los números (3/50, 10/20); derivarlos de ahí tanto en UI como en enforcement.
- Enforcement real en las server actions, gateando por `isPremium`. La validación Zod usa el **techo absoluto** (límite Pro); el límite por plan lo aplica la action.

### Blog

- Posts en `content/blog/*.md` con frontmatter: `title`, `date`, `slug`, `description`
- Funciones de lectura en `lib/blog.ts`
- Renderizado con `marked` (HTML desde Markdown)

### Comentarios

- **Evitar comentarios.** Preferir código autoexplicativo (nombres claros, funciones pequeñas). Comentar solo lo que el código no puede expresar: el *porqué* de una decisión no evidente, no el *qué*.
- Los comentarios de código van **en inglés**, aunque el UI y los strings de cara al usuario sean en español.

### URLs y dominio

- La URL pública canónica se resuelve con `getAppUrl()` (`lib/urls.ts`): `APP_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `VERCEL_URL` → `localhost`. Usarla para todo link absoluto (link público `/p/[slug]`, `metadataBase`/OG, sitemap, robots). **Nunca hardcodear la URL ni leer `NEXT_PUBLIC_APP_URL`.**
- **Auth es distinto:** el `baseURL`/origin check de better-auth necesita el **host del deploy actual**, no el canónico — en cliente `window.location.origin`, en server se deriva de `VERCEL_URL` (+ `trustedOrigins` para que los previews pasen el origin check). No usar `getAppUrl()` para auth.
- Las env vars de URL pueden venir **vacías** (`""`) en algunos scopes de Vercel; al derivar, tratar `""` como ausente (usar `||`, no `??`).

---

## Variables de entorno

Ver `.env.example` para la lista completa. Las críticas:

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión pooled a Neon (para Prisma en edge/serverless) |
| `DIRECT_URL` | Conexión directa a Neon (para migraciones) |
| `BETTER_AUTH_SECRET` | Firma de sesiones |
| `BETTER_AUTH_URL` | Opcional — base de auth; si falta, se deriva del request / `VERCEL_URL` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (el SDK la lee solo) |

> La URL pública de la app **no** se configura por env var: se deriva en runtime con `getAppUrl()` desde las variables que Vercel inyecta (`VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`). `APP_URL` solo se usa como override para un dominio propio.

---

## Comandos de desarrollo

```bash
bun dev          # Inicia el servidor de desarrollo
bun build        # prisma generate + prisma migrate deploy + next build
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
- No leer `NEXT_PUBLIC_APP_URL` ni hardcodear la URL de la app — usar `getAppUrl()` de `lib/urls.ts`
- No escribir comentarios salvo que aclaren algo no evidente; cuando sean necesarios, en inglés
