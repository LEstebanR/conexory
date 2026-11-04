"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { del } from "@vercel/blob"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { invalidatePublicListings } from "@/lib/public-cache"
import { ensureAgentSlug } from "@/lib/agent-slug"
import { HEX_COLOR_REGEX } from "@/lib/flyer-options"
import { sanitizePhoneInput } from "@/lib/phone"
import { normalizeSocialHandle, type SocialNetwork } from "@/lib/social"

// Accepts a pasted profile URL (hence the generous raw length) and stores
// only the bare handle.
const socialHandle = (network: SocialNetwork) =>
  z
    .string()
    .trim()
    .max(300)
    .optional()
    .transform((value) => normalizeSocialHandle(network, value))
    .refine((value) => !value || value.length <= 100, { message: "Revisa tus redes sociales: el usuario quedó muy largo." })

const profileSchema = z.object({
  name: z.string().trim().min(1, "El nombre no puede estar vacío.").max(80, "Máximo 80 caracteres."),
  image: z.string().optional().or(z.literal("")),
  previousImage: z.string().optional().or(z.literal("")),
  location: z.string().trim().max(80, "Máximo 80 caracteres.").optional().or(z.literal("")),
  bio: z.string().trim().max(300, "Máximo 300 caracteres.").optional().or(z.literal("")),
  bioEn: z.string().trim().max(300, "Máximo 300 caracteres.").optional().or(z.literal("")),
  phone: z.string().trim().max(15, "Máximo 15 caracteres.").optional().or(z.literal("")),
  phoneIsWhatsapp: z.enum(["true", "false"]).optional(),
  instagram: socialHandle("instagram"),
  facebook: socialHandle("facebook"),
  tiktok: socialHandle("tiktok"),
  linkedin: socialHandle("linkedin"),
  youtube: socialHandle("youtube"),
  brandColor: z.string().trim().regex(HEX_COLOR_REGEX, "Color inválido."),
})

export type ProfileState = { error?: string; success?: boolean }

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await getSession()
  if (!session) return { error: "Sesión expirada." }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    image: formData.get("image") ?? "",
    previousImage: formData.get("previousImage") ?? "",
    location: formData.get("location") ?? "",
    bio: formData.get("bio") ?? "",
    bioEn: formData.get("bioEn") ?? "",
    phone: formData.get("phone") ?? "",
    phoneIsWhatsapp: formData.get("phoneIsWhatsapp") ?? "false",
    instagram: formData.get("instagram") ?? "",
    facebook: formData.get("facebook") ?? "",
    tiktok: formData.get("tiktok") ?? "",
    linkedin: formData.get("linkedin") ?? "",
    youtube: formData.get("youtube") ?? "",
    brandColor: formData.get("brandColor") ?? "#0a0a0a",
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }

  const { name, image, previousImage, location, bio, bioEn, phone, phoneIsWhatsapp,
    instagram, facebook, tiktok, linkedin, youtube, brandColor } = parsed.data
  const newImage = image || null
  // Defense in depth: the settings form already sanitizes as the agent
  // types (lib/phone.ts sanitizePhoneInput), but this runs regardless of
  // client JS so a stray "+57" can never reach the DB and break wa.me links.
  const sanitizedPhone = phone ? sanitizePhoneInput(phone) : ""

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
      bioEn: bioEn || null,
      phone: sanitizedPhone || null,
      phoneIsWhatsapp: phoneIsWhatsapp === "true",
      instagram,
      facebook,
      tiktok,
      linkedin,
      youtube,
      brandColor,
    },
  })

  invalidatePublicListings()
  revalidatePath("/dashboard", "layout")
  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateBrandColor(color: string): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) return { error: "Sesión expirada." }

  const parsed = z.string().trim().regex(HEX_COLOR_REGEX).safeParse(color)
  if (!parsed.success) return { error: "Color inválido." }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { brandColor: parsed.data },
  })

  revalidatePath("/dashboard", "layout")
  return {}
}

export async function toggleProfilePublished(): Promise<void> {
  const session = await getSession()
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

  invalidatePublicListings()
  revalidatePath("/dashboard/settings")
}
