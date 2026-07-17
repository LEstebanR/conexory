"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ActivateSchema = z.object({
  userId: z.string().min(1),
  premiumUntil: z.coerce.date().refine((d) => d > new Date(), {
    message: "La fecha de expiración debe ser en el futuro.",
  }),
})

const DeactivateSchema = z.object({
  userId: z.string().min(1),
})

export async function toggleUserIsPremium(
  userId: string,
  isPremium: boolean,
  premiumUntil?: string | null
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "No autorizado" }
  }

  if (isPremium) {
    const parsed = ActivateSchema.safeParse({ userId, premiumUntil })
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { isPremium: true, premiumUntil: parsed.data.premiumUntil },
    })
  } else {
    const parsed = DeactivateSchema.safeParse({ userId })
    if (!parsed.success) return { success: false, error: "Solicitud inválida" }

    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { isPremium: false, premiumUntil: null },
    })
  }

  revalidatePath("/admin/usuarios")
  return { success: true }
}
