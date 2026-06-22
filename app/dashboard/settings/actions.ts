"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { del } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ensureAgentSlug } from "@/lib/agent-slug"

const handle = z.string().trim().max(50).optional().or(z.literal(""))

const profileSchema = z.object({
  name: z.string().trim().min(1, "El nombre no puede estar vacío.").max(80, "Máximo 80 caracteres."),
  image: z.string().optional().or(z.literal("")),
  previousImage: z.string().optional().or(z.literal("")),
  location: z.string().trim().max(80, "Máximo 80 caracteres.").optional().or(z.literal("")),
  bio: z.string().trim().max(300, "Máximo 300 caracteres.").optional().or(z.literal("")),
  phone: z.string().trim().max(15, "Máximo 15 caracteres.").optional().or(z.literal("")),
  phoneIsWhatsapp: z.enum(["true", "false"]).optional(),
  instagram: handle,
  facebook: handle,
  tiktok: handle,
  linkedin: handle,
  youtube: handle,
})

export type ProfileState = { error?: string; success?: boolean }

function stripAt(value: string | undefined | null): string | null {
  if (!value) return null
  return value.replace(/^@/, "") || null
}

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return { error: "Sesión expirada." }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    image: formData.get("image") ?? "",
    previousImage: formData.get("previousImage") ?? "",
    location: formData.get("location") ?? "",
    bio: formData.get("bio") ?? "",
    phone: formData.get("phone") ?? "",
    phoneIsWhatsapp: formData.get("phoneIsWhatsapp") ?? "false",
    instagram: formData.get("instagram") ?? "",
    facebook: formData.get("facebook") ?? "",
    tiktok: formData.get("tiktok") ?? "",
    linkedin: formData.get("linkedin") ?? "",
    youtube: formData.get("youtube") ?? "",
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }

  const { name, image, previousImage, location, bio, phone, phoneIsWhatsapp,
    instagram, facebook, tiktok, linkedin, youtube } = parsed.data
  const newImage = image || null

  if (previousImage && previousImage !== image && previousImage.includes("blob.vercel-storage.com")) {
    await del(previousImage).catch(() => null)
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      image: newImage,
      location: location || null,
      bio: bio || null,
      phone: phone || null,
      phoneIsWhatsapp: phoneIsWhatsapp === "true",
      instagram: stripAt(instagram),
      facebook: stripAt(facebook),
      tiktok: stripAt(tiktok),
      linkedin: stripAt(linkedin),
      youtube: stripAt(youtube),
    },
  })

  revalidatePath("/dashboard", "layout")
  return { success: true }
}

export async function toggleProfilePublished(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return

  await ensureAgentSlug(session.user.id, session.user.name, prisma)

  const current = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { profilePublished: true },
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { profilePublished: !current?.profilePublished },
  })

  revalidatePath("/dashboard/settings")
  revalidatePath("/agente", "layout")
}
