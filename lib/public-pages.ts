import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { cachePublicQuery } from "@/lib/public-cache"

export const getPublicProperty = cache(cachePublicQuery(async (slug: string) => {
  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          name: true, email: true, image: true, location: true, bio: true, bioEn: true,
          phone: true, phoneIsWhatsapp: true,
          instagram: true, facebook: true, tiktok: true, linkedin: true, youtube: true,
        },
      },
    },
  })
  if (!property) return null
  return {
    ...property,
    price: Number(property.price),
    previousPrice: property.previousPrice != null ? Number(property.previousPrice) : null,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    pinnedAt: property.pinnedAt?.toISOString() ?? null,
  }
}, "public-property"))

export const getPublicAgent = cache(cachePublicQuery(async (slug: string) => {
  return prisma.user.findUnique({
    where: { agentSlug: slug },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      location: true,
      bio: true,
      phone: true,
      phoneIsWhatsapp: true,
      instagram: true,
      facebook: true,
      tiktok: true,
      linkedin: true,
      youtube: true,
      profilePublished: true,
    },
  })
}, "public-agent"))
