import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const TYPE_TO_PATH: Record<string, string> = {
  whatsapp_click: "{whatsapp}",
  social_instagram_click: "{social,instagram}",
  social_facebook_click: "{social,facebook}",
  social_tiktok_click: "{social,tiktok}",
  social_linkedin_click: "{social,linkedin}",
  social_youtube_click: "{social,youtube}",
  contact_phone_click: "{contact,phone}",
  contact_email_click: "{contact,email}",
  contact_whatsapp_click: "{contact,whatsapp}",
}

const schema = z.object({
  type: z.enum([
    "whatsapp_click",
    "social_instagram_click",
    "social_facebook_click",
    "social_tiktok_click",
    "social_linkedin_click",
    "social_youtube_click",
    "contact_phone_click",
    "contact_email_click",
    "contact_whatsapp_click",
  ]),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 })
  }

  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, published: true },
  })
  if (!property || !property.published) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  const path = TYPE_TO_PATH[parsed.data.type]
  await prisma.$executeRaw`
    UPDATE properties
    SET metrics = jsonb_set(
      metrics,
      ${path}::text[],
      to_jsonb(COALESCE((metrics #>> ${path}::text[])::int, 0) + 1)
    )
    WHERE id = ${id}
  `

  return NextResponse.json({ ok: true })
}
