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

**No hay sistema de planes activo:** todo el código debe asumir comportamiento de plan free. Los límites (3 propiedades, 10 fotos) aplican a todos los usuarios sin checks de plan hasta que se implemente la pasarela.

**No se va a hacer:** estadísticas de visitas, dominio personalizado, app móvil.

**Auth:** Google + email/contraseña es suficiente para el mercado colombiano. No se agregarán más providers OAuth.

**Infraestructura GitHub:** CI con typecheck y lint corre en cada PR. Branch protection en `main` requiere que pasen todos los checks. Formato de rama obligatorio: `{type}/LES-{número}-{descripción}`.

**Compresión de imágenes pendiente:** browser-image-compression en cliente + sharp en servidor, convertir a WebP, límite entrante 20 MB (resultado almacenado ~200–500 KB).

**How to apply:** Al proponer nuevas funciones o cambios, tener en cuenta que los pagos son la prioridad. Todo límite por plan debe codificarse como constante del plan free hasta que existan planes reales.
