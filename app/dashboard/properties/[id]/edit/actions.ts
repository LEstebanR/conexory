"use server"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PropertySchema, type PropertyInput } from "@/lib/validations/property"
import { photoLimit } from "@/lib/plans"

type UpdateResult = { success: true } | { success: false; error: string }

export async function updateProperty(
  propertyId: string,
  data: PropertyInput
): Promise<UpdateResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false, error: "Sesión expirada. Vuelve a iniciar sesión." }

    const parsed = PropertySchema.safeParse(data)
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

    const maxPhotos = photoLimit(session.user.isPremium)
    if (parsed.data.images.length > maxPhotos) {
      return { success: false, error: `Tu plan permite máximo ${maxPhotos} fotos por propiedad.` }
    }

    await prisma.property.update({
      where: { id: propertyId, userId: session.user.id },
      data: {
        title: parsed.data.title,
        type: parsed.data.type,
        price: parsed.data.price,
        state: parsed.data.state,
        city: parsed.data.city,
        neighborhood: parsed.data.neighborhood,
        area: parsed.data.area,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        parking: parsed.data.parking,
        description: parsed.data.description,
        images: parsed.data.images,
        videoUrl: parsed.data.videoUrl,
        latitude: parsed.data.latitude ?? null,
        longitude: parsed.data.longitude ?? null,
        showContact: parsed.data.showContact,
      },
    })

    return { success: true }
  } catch (err) {
    console.error("updateProperty failed:", err)
    return {
      success: false,
      error:
        "No pudimos guardar los cambios. Revisa tu conexión y, si agregaste un video, que el enlace sea de YouTube. Si el problema persiste, recarga la página.",
    }
  }
}
