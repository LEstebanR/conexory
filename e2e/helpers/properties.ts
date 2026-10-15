import { prisma } from "@/lib/prisma"

export async function seedProperty(
  userId: string,
  overrides: { title?: string; published?: boolean } = {}
): Promise<{ id: string; slug: string; title: string }> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return prisma.property.create({
    data: {
      userId,
      title: overrides.title ?? `Casa sembrada ${suffix}`,
      slug: `casa-sembrada-${suffix}`,
      type: "house",
      transactionType: "sale",
      price: 500_000_000,
      city: "Medellín",
      state: "Antioquia",
      images: [],
      published: overrides.published ?? true,
    },
    select: { id: true, slug: true, title: true },
  })
}
