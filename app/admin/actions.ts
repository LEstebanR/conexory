"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const ToggleIsPremiumSchema = z.object({
  userId: z.string().min(1),
  isPremium: z.boolean(),
})

export async function toggleUserIsPremium(
  userId: string,
  isPremium: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "No autorizado" }
  }

  const parsed = ToggleIsPremiumSchema.safeParse({ userId, isPremium })
  if (!parsed.success) return { success: false, error: "Solicitud inválida" }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { isPremium: parsed.data.isPremium },
  })

  revalidatePath("/admin/usuarios")
  return { success: true }
}
