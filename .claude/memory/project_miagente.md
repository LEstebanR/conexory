---
name: project-miagente
description: Contexto del proyecto MiAgente — qué es, stack y estado funcional actual
metadata:
  type: project
---

MiAgente es un SaaS para agentes inmobiliarios en Colombia. Freemium: plan gratuito (3 propiedades) + plan Pro ($99.999 COP/mes).

**Stack:** Next.js 16.2.6, React 19, TypeScript, Tailwind CSS 4, better-auth, Prisma 5 + Neon PostgreSQL, Vercel Blob, Bun, Vercel deploy.

**Funcional hoy:** creación de propiedades, link único, WhatsApp sharing con OG preview, auth email+Google, blog, páginas de precios y roadmap.

**Pendiente para completar el MVP:** pasarela de pagos (Wompi o Stripe) y suscripciones — el plan Pro no está activo todavía. El enforcement del límite de 3 propiedades tampoco está implementado.

**No se va a hacer:** estadísticas de visitas, dominio personalizado, app móvil.

**How to apply:** Al proponer nuevas funciones o cambios, tener en cuenta que los pagos son la prioridad antes de cualquier otra cosa.
