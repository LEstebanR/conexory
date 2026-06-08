"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const FREE_PLAN_LIMIT = 3

async function generateUniqueSlug(): Promise<string> {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = Array.from({ length: 7 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("")
    const existing = await prisma.property.findUnique({ where: { slug } })
    if (!existing) return slug
  }
  throw new Error("No se pudo generar un slug único")
}

type CreateResult = { success: true; id: string } | { success: false; error: string }

export async function createProperty(data: {
  title: string
  type: string
  price: string
  city: string
  neighborhood: string
  area: string
  bedrooms: string
  bathrooms: string
  parking: string
  description: string
  images: string[]
}): Promise<CreateResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Sesión expirada. Vuelve a iniciar sesión." }

    if (!session.user.isPremium) {
      const activeCount = await prisma.property.count({
        where: { userId: session.user.id, published: true },
      })
      if (activeCount >= FREE_PLAN_LIMIT) {
        return {
          success: false,
          error: `Has alcanzado el límite de ${FREE_PLAN_LIMIT} propiedades activas del plan gratuito. Actualiza a Pro para crear propiedades ilimitadas.`,
        }
      }
    }

    const slug = await generateUniqueSlug()
    const property = await prisma.property.create({
      data: {
        slug,
        userId: session.user.id,
        title: data.title.trim(),
        type: data.type,
        price: parseFloat(data.price) || 0,
        city: data.city.trim(),
        neighborhood: data.neighborhood.trim() || null,
        area: data.area ? parseFloat(data.area) : null,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        parking: data.parking ? parseInt(data.parking) : null,
        description: data.description.trim() || null,
        images: data.images,
      },
    })

    return { success: true, id: property.id }
  } catch {
    return { success: false, error: "Error inesperado al crear la propiedad. Intenta de nuevo." }
  }
}
