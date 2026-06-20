import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import EditForm, { type InitialData } from "./edit-form"

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const property = await prisma.property.findUnique({
    where: { id, userId: session.user.id },
  })

  if (!property) notFound()

  const initial: InitialData = {
    id: property.id,
    title: property.title,
    type: property.type,
    price: Math.round(Number(property.price)).toString(),
    state: property.state ?? "",
    city: property.city,
    neighborhood: property.neighborhood ?? "",
    area: property.area?.toString() ?? "",
    bedrooms: property.bedrooms?.toString() ?? "",
    bathrooms: property.bathrooms?.toString() ?? "",
    parking: property.parking?.toString() ?? "",
    description: property.description ?? "",
    images: property.images,
    videoUrl: property.videoUrl ?? "",
    latitude: property.latitude ?? null,
    longitude: property.longitude ?? null,
    showContact: property.showContact,
  }

  return <EditForm initial={initial} isPremium={session.user.isPremium} />
}
