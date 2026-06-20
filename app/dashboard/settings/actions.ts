"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { del } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const profileSchema = z.object({
  name: z.string().trim().min(1, "El nombre no puede estar vacío.").max(80, "Máximo 80 caracteres."),
  image: z.string().optional().or(z.literal("")),
  previousImage: z.string().optional().or(z.literal("")),
  location: z.string().trim().max(80, "Máximo 80 caracteres.").optional().or(z.literal("")),
  bio: z.string().trim().max(300, "Máximo 300 caracteres.").optional().or(z.literal("")),
  phone: z.string().trim().max(20, "Máximo 20 caracteres.").optional().or(z.literal("")),
  phoneIsWhatsapp: z.enum(["true", "false"]).optional(),
})

export type ProfileState = { error?: string; success?: boolean }

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
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }

  const { name, image, previousImage, location, bio, phone, phoneIsWhatsapp } = parsed.data
  const newImage = image || null

  // Delete previous avatar from Vercel Blob if it's being cleared or replaced
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
    },
  })

  revalidatePath("/dashboard", "layout")
  return { success: true }
}
