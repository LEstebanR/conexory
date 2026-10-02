import { prisma } from "@/lib/prisma"
import { cachePublicQuery } from "@/lib/public-cache"

export const getFeaturedProperties = cachePublicQuery(
  async () => {
    const properties = await prisma.property.findMany({
      where: { published: true },
      orderBy: { shares: "desc" },
      take: 10,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        type: true,
        transactionType: true,
        city: true,
        neighborhood: true,
        images: true,
      },
    })

    return properties.map((property) => ({ ...property, price: Number(property.price) }))
  },
  "featured-properties",
)
