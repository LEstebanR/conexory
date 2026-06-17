# Conexory

SaaS para agentes inmobiliarios en Colombia. Crea fichas de propiedades, obtén un link único por propiedad y compártelas por WhatsApp con preview enriquecida — en menos de 60 segundos.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS 4** con tokens `brand-*`
- **better-auth** — email/contraseña + Google OAuth
- **Prisma 5** + **Neon** (PostgreSQL serverless)
- **Vercel Blob** — almacenamiento de imágenes
- **Bun** como package manager y runtime

## Requisitos previos

- [Bun](https://bun.sh) >= 1.0
- Una base de datos en [Neon](https://neon.tech) (o PostgreSQL local)
- Credenciales de Google OAuth ([Google Cloud Console](https://console.cloud.google.com))

## Configuración local

```bash
# 1. Instalar dependencias
bun install

# 2. Variables de entorno
cp .env.example .env
# Completar los valores en .env (ver sección abajo)

# 3. Generar cliente de Prisma y correr migraciones
bunx prisma migrate dev

# 4. Iniciar servidor de desarrollo
bun dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión pooled a Neon (para queries en runtime) |
| `DIRECT_URL` | Conexión directa a Neon (para migraciones) |
| `BETTER_AUTH_SECRET` | Secret para firmar sesiones — generar con `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | URL base de la app (ej: `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Igual que `BETTER_AUTH_URL` |
| `GOOGLE_CLIENT_ID` | OAuth de Google |
| `GOOGLE_CLIENT_SECRET` | OAuth de Google |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob para subida de imágenes |

Para Google OAuth, agregar como URI de redirección autorizada:
```
http://localhost:3000/api/auth/callback/google
```

## Comandos

```bash
bun dev                    # Servidor de desarrollo
bun build                  # Build de producción (incluye prisma generate)
bun typecheck              # Verificación de tipos TypeScript
bun lint                   # ESLint
bunx prisma migrate dev    # Nueva migración
bunx prisma studio         # GUI de la base de datos
```

## Estructura principal

```
app/
  page.tsx              # Landing pública
  dashboard/            # Panel del agente (autenticado)
  p/[slug]/             # Vista pública de propiedad (sin login)
  api/
    auth/[...all]/      # Handler de better-auth
    upload/             # Subida de imágenes a Vercel Blob
components/
  ui/                   # Componentes atómicos (Button, Input, Badge)
lib/
  auth.ts               # Config de better-auth (servidor)
  prisma.ts             # Singleton de PrismaClient
content/blog/           # Posts en Markdown
prisma/schema.prisma    # Esquema de base de datos
```

## Convenciones de desarrollo

Ver [`AGENTS.md`](./AGENTS.md) para convenciones de código, patrones y reglas del proyecto.

### Ramas y PRs

Las ramas siguen el formato `{type}/LES-{número}-{descripción}`:

```
feat/LES-149-plan-pro-subscriptions
fix/LES-158-image-compression
```

Tipos válidos: `feat`, `fix`, `refactor`, `chore`, `docs`. El formato se valida automáticamente en CI.
