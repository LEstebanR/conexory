"use server"

import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { del } from "@vercel/blob"
import { setOnboardingFlag } from "@/lib/onboarding-server"
import {
  SHARE_MESSAGE_KINDS,
  generateShareMessage as generateShareMessageWithAI,
} from "@/lib/share-message"

export async function togglePublished(propertyId: string, published: boolean) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error("No autenticado")

  await prisma.property.update({
    where: { id: propertyId, userId: session.user.id },
    data: { published },
  })
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
})

export async function generateShareMessage(input: {
  propertyId: string
  kind: string
}): Promise<{ message: string } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: "No autenticado" }

  const parsed = GenerateMessageSchema.safeParse(input)
  if (!parsed.success) return { error: "Solicitud inválida" }

  const property = await prisma.property.findUnique({
    where: { id: parsed.data.propertyId, userId: session.user.id },
  })
  if (!property) return { error: "Propiedad no encontrada" }

  const message = await generateShareMessageWithAI(property, parsed.data.kind)
  if (!message) return { error: "No pudimos generar el mensaje. Inténtalo de nuevo." }

  return { message }
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
