import { revalidateTag, unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

const FEATURED_PROPERTIES_TAG = "featured-properties"

export const getFeaturedProperties = unstable_cache(
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
  [FEATURED_PROPERTIES_TAG],
  { tags: [FEATURED_PROPERTIES_TAG], revalidate: 60 * 60 * 24 },
)

export function invalidateFeaturedProperties() {
  revalidateTag(FEATURED_PROPERTIES_TAG, { expire: 0 })
}
