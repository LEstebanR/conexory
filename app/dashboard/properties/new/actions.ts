"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("No autenticado")

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

  return { id: property.id }
}
