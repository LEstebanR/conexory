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
  const webp = await sharp(buffer)
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  const filename = `properties/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`
  const blob = await put(filename, webp, { access: "public", contentType: "image/webp" })

  return NextResponse.json({ url: blob.url })
}
