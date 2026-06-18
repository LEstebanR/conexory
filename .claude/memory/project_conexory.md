---
name: project-conexory
description: Contexto del proyecto Conexory — qué es, stack y estado funcional actual
metadata:
  type: project
---

Conexory es un SaaS para agentes inmobiliarios en Colombia. Freemium con tres planes:
- **Free:** 3 propiedades activas, 10 fotos por propiedad.
- **Pro ($99.999 COP/mes):** 50 propiedades, 20 fotos por propiedad.
- **Personalizado:** equipos/agencias, sin límite, por contacto (`/contacto`).

**Stack:** Next.js 16.2.6, React 19, TypeScript, Tailwind CSS 4, better-auth, Prisma 5 + Neon PostgreSQL, Vercel Blob, Bun, Vercel deploy.

**Funcional hoy:** creación de propiedades, link único, WhatsApp sharing con OG preview, auth email+Google, blog, páginas de precios y roadmap.

**Sistema de planes — estado actual (cambió):** ya existe el flag `User.isPremium` (boolean) en el modelo y expuesto en la sesión (server con `getSession`, client con `useSession` — el auth-client usa `inferAdditionalFields` para tiparlo). Los límites por plan viven en `lib/plans.ts` (`propertyLimit()`/`photoLimit()`, fuente única) y **se aplican (enforcement real) server-side en las server actions**, gateando por `isPremium`. Ya NO es "asumir free para todos": el código debe respetar el modelo por plan y derivar todo límite de `lib/plans.ts` (nunca hardcodear 3/50 ni 10/20).

**Decisión de producto:** los planes se presentan en la UI como **ya lanzados** (no "próximamente"); el CTA de Pro en `/precios` enlaza a registro.

**Pendiente para completar el MVP:** pasarela de pagos (Wompi o Stripe) y suscripciones. Hasta integrarla, **nadie es premium** (no hay forma de asignar `isPremium`), pero el enforcement por plan ya está en su lugar.

**Precios (mercado colombiano):** los valores inmobiliarios se manejan en millones/miles de millones de COP y ocupan mucho espacio. Convención: en UI de espacio reducido (cards/listas) usar formato compacto en millones (`$580 M`, `$1.250 M` — helper `formatCompactCOP` en `app/dashboard/page.tsx`); en detalle del dashboard y vista pública `/p/[slug]` mostrar el **valor exacto completo** (un comprador necesita el precio real).

**No se va a hacer:** estadísticas de visitas, dominio personalizado, app móvil.

**Auth:** Google + email/contraseña es suficiente para el mercado colombiano. No se agregarán más providers OAuth.

**Infraestructura GitHub:** CI con typecheck y lint corre en cada PR. Branch protection en `main` requiere que pasen todos los checks. Formato de rama obligatorio: `{type}/LES-{número}-{descripción}`.

**Compresión de imágenes pendiente:** browser-image-compression en cliente + sharp en servidor, convertir a WebP, límite entrante 20 MB (resultado almacenado ~200–500 KB).

**How to apply:** Al proponer nuevas funciones o cambios, tener en cuenta que la pasarela de pagos es la prioridad del MVP (es lo único que falta para activar premium real). Todo límite por plan debe derivarse de `lib/plans.ts` y aplicarse server-side gateando por `isPremium` — nunca hardcodear los números ni asumir "free para todos".
