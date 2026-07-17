"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { del } from "@vercel/blob"
import { setOnboardingFlag } from "@/lib/onboarding-server"
import { generateShareMessage as generateShareMessageWithAI } from "@/lib/share-message"
import { SHARE_INFO_IDS, SHARE_MESSAGE_KINDS } from "@/lib/share-message-options"
import { propertyLimit, pinnedLimit, hasProAccess, aiMessageLimit } from "@/lib/plans"

export async function togglePublished(
  propertyId: string,
  published: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "Sesión expirada. Vuelve a iniciar sesión." }

  if (published) {
    const proAccess = hasProAccess(session.user)
    const limit = propertyLimit(proAccess)
    const activeCount = await prisma.property.count({
      where: { userId: session.user.id, published: true, id: { not: propertyId } },
    })
    if (activeCount >= limit) {
      return {
        success: false,
        error: proAccess
          ? `Has alcanzado el máximo de ${limit} propiedades activas de tu plan Pro. Contáctanos para un plan personalizado.`
          : `Has alcanzado el límite de ${limit} propiedades activas del plan gratuito. Actualiza a Pro para activar más.`,
      }
    }
  }

  await prisma.property.update({
    where: { id: propertyId, userId: session.user.id },
    data: { published },
  })

  return { success: true }
}

export async function togglePinned(
  propertyId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "Sesión expirada. Vuelve a iniciar sesión." }

  const property = await prisma.property.findUnique({
    where: { id: propertyId, userId: session.user.id },
    select: { pinnedAt: true },
  })
  if (!property) return { success: false, error: "Propiedad no encontrada" }

  const willPin = property.pinnedAt == null

  if (willPin) {
    const limit = pinnedLimit()
    const pinnedCount = await prisma.property.count({
      where: { userId: session.user.id, pinnedAt: { not: null }, id: { not: propertyId } },
    })
    if (pinnedCount >= limit) {
      return {
        success: false,
        error: `Ya tienes ${limit} propiedades fijadas. Desfija una para fijar esta.`,
      }
    }
  }

  await prisma.property.update({
    where: { id: propertyId, userId: session.user.id },
    data: { pinnedAt: willPin ? new Date() : null },
  })

  revalidatePath("/agente", "layout")
  revalidatePath(`/dashboard/properties/${propertyId}`)

  return { success: true }
}

export async function toggleShowContact(propertyId: string, showContact: boolean) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("No autenticado")

  await prisma.property.update({
    where: { id: propertyId, userId: session.user.id },
    data: { showContact },
  })
}

export async function incrementShares(propertyId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return
  // Scope to the owner so the counter can't be inflated for someone else's property.
  const { count } = await prisma.property.updateMany({
    where: { id: propertyId, userId: session.user.id },
    data: { shares: { increment: 1 } },
  })
  if (count > 0) {
    await setOnboardingFlag(session.user.id, "firstPropertyShared").catch(() => {})
  }
}

const GenerateMessageSchema = z.object({
  propertyId: z.string().min(1),
  kind: z.enum(SHARE_MESSAGE_KINDS),
  include: z.array(z.enum(SHARE_INFO_IDS)).max(SHARE_INFO_IDS.length).default([...SHARE_INFO_IDS]),
})

export async function generateShareMessage(input: {
  propertyId: string
  kind: string
  include?: string[]
}): Promise<{ message: string; usedToday?: number; limit?: number } | { error: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { error: "No autenticado" }
    if (!hasProAccess(session.user)) return { error: "Generar con IA es una función Pro" }

    const parsed = GenerateMessageSchema.safeParse(input)
    if (!parsed.success) return { error: "Solicitud inválida" }

    const isAdmin = session.user.role === "admin"

    if (!isAdmin) {
      const now = new Date()
      const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { aiMessagesUsedToday: true, aiMessagesResetAt: true },
      })
      if (!dbUser) return { error: "Usuario no encontrado" }
      const needsReset = !dbUser.aiMessagesResetAt || dbUser.aiMessagesResetAt < todayUTC
      const usedToday = needsReset ? 0 : dbUser.aiMessagesUsedToday
      const limit = aiMessageLimit(session.user.isPremium)
      if (usedToday >= limit) {
        return { error: `Alcanzaste el límite de ${limit} mensajes generados con IA por día. Vuelve mañana.` }
      }
    }

    const property = await prisma.property.findUnique({
      where: { id: parsed.data.propertyId, userId: session.user.id },
    })
    if (!property) return { error: "Propiedad no encontrada" }

    const message = await generateShareMessageWithAI(property, parsed.data.kind, parsed.data.include, session.user.name)
    if (!message) return { error: "No pudimos generar el mensaje. Inténtalo de nuevo." }

    if (!isAdmin) {
      const now = new Date()
      const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { aiMessagesUsedToday: true, aiMessagesResetAt: true },
      })
      const needsReset = !dbUser?.aiMessagesResetAt || dbUser.aiMessagesResetAt < todayUTC
      const newCount = needsReset ? 1 : (dbUser?.aiMessagesUsedToday ?? 0) + 1
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          aiMessagesUsedToday: newCount,
          aiMessagesResetAt: todayUTC,
        },
      })
      return { message, usedToday: newCount, limit: aiMessageLimit(session.user.isPremium) }
    }

    return { message }
  } catch {
    return { error: "No pudimos generar el mensaje. Inténtalo de nuevo." }
  }
}

export async function deleteProperty(propertyId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("No autenticado")

  const property = await prisma.property.findUnique({
    where: { id: propertyId, userId: session.user.id },
    select: { images: true },
  })
  if (!property) throw new Error("Propiedad no encontrada")

  if (property.images.length > 0) {
    await del(property.images)
  }

  await prisma.property.delete({
    where: { id: propertyId, userId: session.user.id },
  })
}
