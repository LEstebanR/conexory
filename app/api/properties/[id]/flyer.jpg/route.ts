import { headers } from "next/headers"
import { list, put } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateFlyerJpeg } from "@/lib/flyer"

export const runtime = "nodejs"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { id } = await params
  const property = await prisma.property.findUnique({
    where: { id, userId: session.user.id },
    include: { user: { select: { name: true, image: true } } },
  })
  if (!property) return new Response("Not found", { status: 404 })

  const regen = new URL(req.url).searchParams.get("regen") === "1"
  const cacheKey = `flyer/${property.id}-${property.updatedAt.getTime()}.jpg`

  if (!regen) {
    const { blobs } = await list({ prefix: cacheKey, limit: 1 }).catch(() => ({ blobs: [] }))
    if (blobs[0]) return Response.redirect(blobs[0].url, 302)
  }

  const jpeg = await generateFlyerJpeg(property, property.user)

  await put(cacheKey, jpeg, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: false,
    allowOverwrite: true,
  }).catch(() => null)

  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" },
  })
}
