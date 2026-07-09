import { createHash } from "crypto"
import { headers } from "next/headers"
import { list, put } from "@vercel/blob"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateFlyerJpeg } from "@/lib/flyer"
import { FLYER_INFO_IDS, FLYER_STYLE_IDS, type FlyerInfo } from "@/lib/flyer-options"

export const runtime = "nodejs"
// AI image generation takes ~15-30 s; the default function timeout is too low.
export const maxDuration = 60

const QuerySchema = z.object({
  style: z.enum(FLYER_STYLE_IDS).catch("premium"),
  highlight: z
    .string()
    .trim()
    .max(120)
    .optional()
    .catch(undefined),
  include: z
    .string()
    .optional()
    .transform(
      (csv): FlyerInfo[] =>
        (csv?.split(",").filter((v): v is FlyerInfo => (FLYER_INFO_IDS as readonly string[]).includes(v)) ??
          [...FLYER_INFO_IDS])
    ),
  regen: z.string().optional(),
})

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return new Response("Unauthorized", { status: 401 })

  const { id } = await params
  const property = await prisma.property.findUnique({
    where: { id, userId: session.user.id },
    include: { user: { select: { name: true, image: true, phone: true } } },
  })
  if (!property) return new Response("Not found", { status: 404 })

  const url = new URL(req.url)
  const query = QuerySchema.parse(Object.fromEntries(url.searchParams))
  const options = {
    style: query.style,
    highlight: query.highlight || undefined,
    include: query.include,
  }

  const optionsHash = createHash("md5").update(JSON.stringify(options)).digest("hex").slice(0, 8)
  const cacheKey = `flyer/${property.id}-${property.updatedAt.getTime()}-${optionsHash}.jpg`

  if (query.regen !== "1") {
    const { blobs } = await list({ prefix: cacheKey, limit: 1 }).catch(() => ({ blobs: [] }))
    if (blobs[0]) return Response.redirect(blobs[0].url, 302)
  }

  const jpeg = await generateFlyerJpeg(property, property.user, options)

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
