"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSession } from "@/lib/auth"
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

const UpdateUntilSchema = z.object({
  userId: z.string().min(1),
  premiumUntil: z.coerce.date().refine((d) => d > new Date(), {
    message: "La fecha de expiración debe ser en el futuro.",
  }),
})

const UpdateSubscriptionUntilSchema = z.object({
  userId: z.string().min(1),
  currentPeriodEnd: z.coerce.date().refine((d) => d > new Date(), {
    message: "La fecha de expiración debe ser en el futuro.",
  }),
})

export async function toggleUserIsPremium(
  userId: string,
  isPremium: boolean,
  premiumUntil?: string | null
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession()
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

export async function updatePremiumUntil(
  userId: string,
  premiumUntil: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession()
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "No autorizado" }
  }

  const parsed = UpdateUntilSchema.safeParse({ userId, premiumUntil })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { premiumUntil: parsed.data.premiumUntil },
  })

  revalidatePath("/admin/usuarios")
  return { success: true }
}

// Support override for a real Mercado Pago subscriber — separate from
// updatePremiumUntil, which only applies to Pro granted manually without
// billing. A later webhook (e.g. the next renewal charge) can still move
// this date again; this is a one-off adjustment, not a way to detach the
// user from Mercado Pago's billing.
export async function updateSubscriptionPeriodEnd(
  userId: string,
  currentPeriodEnd: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession()
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "No autorizado" }
  }

  const parsed = UpdateSubscriptionUntilSchema.safeParse({ userId, currentPeriodEnd })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: parsed.data.userId },
    select: { userId: true },
  })
  if (!subscription) return { success: false, error: "Este usuario no tiene una suscripción" }

  await prisma.subscription.update({
    where: { userId: parsed.data.userId },
    data: { currentPeriodEnd: parsed.data.currentPeriodEnd },
  })

  revalidatePath("/admin/usuarios")
  return { success: true }
}
