"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function updateProperty(
  propertyId: string,
  data: {
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
  }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("No autenticado")

  await prisma.property.update({
    where: { id: propertyId, userId: session.user.id },
    data: {
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

  return { id: propertyId }
}
