"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PropertySchema, type PropertyInput } from "@/lib/validations/property"

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

export async function createProperty(data: PropertyInput): Promise<CreateResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Sesión expirada. Vuelve a iniciar sesión." }

    const parsed = PropertySchema.safeParse(data)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

    const slug = await generateUniqueSlug()
    const property = await prisma.property.create({
      data: {
        slug,
        userId: session.user.id,
        title: parsed.data.title,
        type: parsed.data.type,
        price: parsed.data.price,
        city: parsed.data.city,
        neighborhood: parsed.data.neighborhood,
        area: parsed.data.area,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        parking: parsed.data.parking,
        description: parsed.data.description,
        images: parsed.data.images,
      },
    })

    return { success: true, id: property.id }
  } catch {
    return { success: false, error: "Error inesperado al crear la propiedad. Intenta de nuevo." }
  }
}
