import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import sharp from "sharp"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const MAX_SIZE_BYTES = 20 * 1024 * 1024

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const form = await request.formData()
  const file = form.get("file") as File | null

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Máximo 20 MB por imagen" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  // JPEG (not WebP): WhatsApp and other OG consumers don't render WebP
  // previews, and these photos exist to be shared over WhatsApp.
  // `.rotate()` bakes in EXIF orientation so portrait phone photos aren't
  // displayed sideways.
  const jpeg = await sharp(buffer)
    .rotate()
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()

  const filename = `properties/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
  const blob = await put(filename, jpeg, { access: "public", contentType: "image/jpeg" })

  return NextResponse.json({ url: blob.url })
}
