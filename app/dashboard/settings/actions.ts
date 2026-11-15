"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { del, list } from "@vercel/blob"
import { auth, getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cancelPreapproval } from "@/lib/mercadopago"
import { reportError } from "@/lib/report-error"
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

export type DeleteAccountState = { error?: string }

const BILLABLE_SUBSCRIPTION_STATUSES = ["active", "past_due", "incomplete"]

const deleteAccountSchema = z.object({
  confirmEmail: z.string().trim().toLowerCase().max(320),
})

function isBlobUrl(url: string | null | undefined): url is string {
  return !!url && url.includes("blob.vercel-storage.com")
}

async function listFlyerBlobs(propertyIds: string[]): Promise<string[]> {
  const listings = await Promise.all(
    propertyIds.map((id) => list({ prefix: `flyer/${id}-` })),
  )
  return listings.flatMap(({ blobs }) => blobs.map((blob) => blob.url))
}

async function collectUserBlobUrls(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true, properties: { select: { id: true, images: true } } },
  })
  if (!user) return []

  const urls = [
    ...user.properties.flatMap((property) => property.images).filter(isBlobUrl),
    ...(isBlobUrl(user.image) ? [user.image] : []),
  ]
  try {
    urls.push(...(await listFlyerBlobs(user.properties.map((property) => property.id))))
  } catch (error) {
    await reportError("deleteAccount: listing flyer blobs failed", error, { userId })
  }
  return urls
}

export async function deleteAccount(
  _prev: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const session = await getSession()
  if (!session) return { error: "Sesión expirada." }
  const userId = session.user.id

  const parsed = deleteAccountSchema.safeParse({ confirmEmail: formData.get("confirmEmail") ?? "" })
  if (!parsed.success || parsed.data.confirmEmail !== session.user.email.trim().toLowerCase()) {
    return { error: "El email no coincide con el de tu cuenta." }
  }

  // Cancel billing first and abort on failure: deleting the account while
  // Mercado Pago keeps charging would leave a paying customer with no account.
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { mpPreapprovalId: true, status: true },
  })
  const preapprovalId = subscription?.mpPreapprovalId
  const mustCancel = !!preapprovalId && BILLABLE_SUBSCRIPTION_STATUSES.includes(subscription.status)
  if (mustCancel) {
    const result = await cancelPreapproval(preapprovalId)
    if (!result.ok) {
      await reportError("deleteAccount: Mercado Pago cancel failed", undefined, {
        userId,
        preapprovalId,
        error: result.error,
      })
      return {
        error: "No pudimos cancelar tu suscripción, así que no eliminamos tu cuenta. Inténtalo de nuevo o escríbenos.",
      }
    }
  }

  // URLs are collected before the delete (the cascade takes the rows with it)
  // but blobs are removed after it: if the DB delete fails, the account must
  // stay intact rather than survive with broken images.
  const blobUrls = await collectUserBlobUrls(userId)

  try {
    await prisma.user.delete({ where: { id: userId } })
  } catch (error) {
    await reportError("deleteAccount: user delete failed", error, {
      userId,
      preapprovalCancelled: mustCancel,
    })
    return { error: "No pudimos eliminar tu cuenta. Inténtalo de nuevo o escríbenos." }
  }

  if (blobUrls.length > 0) {
    // Orphaned blobs are cleanable later; the account is already gone, so a
    // Blob failure must not surface as an error to the user.
    await del(blobUrls).catch((error) =>
      reportError("deleteAccount: Blob cleanup failed", error, { userId, blobCount: blobUrls.length }),
    )
  }

  // The session row is already gone (cascade); this just clears the cookie.
  await auth.api.signOut({ headers: await headers() }).catch(() => null)
  invalidatePublicListings()
  redirect("/?cuenta=eliminada")
}
