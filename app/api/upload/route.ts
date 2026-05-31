import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const form = await request.formData()
  const file = form.get("file") as File | null

  if (!file || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Máximo 5 MB por imagen" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const filename = `properties/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const blob = await put(filename, file, { access: "public" })

  return NextResponse.json({ url: blob.url })
}
