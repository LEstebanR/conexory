import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const schema = z.object({
  type: z.enum(["whatsapp_click", "phone_click", "email_click"]),
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

  await prisma.propertyEvent.create({
    data: { propertyId: id, type: parsed.data.type },
  })

  return NextResponse.json({ ok: true })
}
