"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function togglePublished(propertyId: string, published: boolean) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("No autenticado")

  await prisma.property.update({
    where: { id: propertyId, userId: session.user.id },
    data: { published },
  })
}

export async function incrementShares(propertyId: string) {
  await prisma.property.update({
    where: { id: propertyId },
    data: { shares: { increment: 1 } },
  })
}
