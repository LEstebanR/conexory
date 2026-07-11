"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { del } from "@vercel/blob"
import { setOnboardingFlag } from "@/lib/onboarding-server"
import { generateShareMessage as generateShareMessageWithAI } from "@/lib/share-message"
import { SHARE_INFO_IDS, SHARE_MESSAGE_KINDS } from "@/lib/share-message-options"
import { propertyLimit } from "@/lib/plans"

export async function togglePublished(
  propertyId: string,
  published: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { success: false, error: "Sesión expirada. Vuelve a iniciar sesión." }

  if (published) {
    const limit = propertyLimit(session.user.isPremium)
    const activeCount = await prisma.property.count({
      where: { userId: session.user.id, published: true, id: { not: propertyId } },
    })
    if (activeCount >= limit) {
      return {
        success: false,
        error: session.user.isPremium
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
}): Promise<{ message: string } | { error: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { error: "No autenticado" }
    if (!session.user.isPremium) return { error: "Generar con IA es una función Pro" }

    const parsed = GenerateMessageSchema.safeParse(input)
    if (!parsed.success) return { error: "Solicitud inválida" }

    const property = await prisma.property.findUnique({
      where: { id: parsed.data.propertyId, userId: session.user.id },
    })
    if (!property) return { error: "Propiedad no encontrada" }

    const message = await generateShareMessageWithAI(property, parsed.data.kind, parsed.data.include, session.user.name)
    if (!message) return { error: "No pudimos generar el mensaje. Inténtalo de nuevo." }

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
