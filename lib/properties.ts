import { prisma } from "@/lib/prisma"
import type { AgentProperty } from "@/app/agente/[slug]/agent-properties"

// Shared by the public /propiedades directory and its authenticated
// dashboard counterpart — both list every published property app-wide.
export async function getPublishedProperties(): Promise<AgentProperty[]> {
  const properties = await prisma.property.findMany({
    where: { published: true },
    orderBy: [
      { pinnedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      transactionType: true,
      price: true,
      city: true,
      state: true,
      neighborhood: true,
      images: true,
      area: true,
      bedrooms: true,
      bathrooms: true,
      parking: true,
      shares: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      pinnedAt: true,
    },
  })

  return properties.map((p) => ({
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.getTime(),
    pinnedAt: p.pinnedAt ? p.pinnedAt.getTime() : null,
  }))
}
