"use server"

import { z } from "zod"
import { prisma } from "@/lib/prisma"

const slugSchema = z.string().min(1).max(200)

export async function registerShare(rawSlug: string) {
  const parsed = slugSchema.safeParse(rawSlug)
  if (!parsed.success) return

  await prisma.property.updateMany({
    where: { slug: parsed.data, published: true },
    data: { shares: { increment: 1 } },
  })
}
