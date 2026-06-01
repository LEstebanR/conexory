import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { ArrowLeft, BedDouble, Bath, Square, Car, MapPin, EyeOff } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import SharePanel from "./share-panel"
import PropertyCarousel from "@/components/property-carousel"
import PropertyActions from "./property-actions"

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  office: "Oficina",
  commercial: "Local comercial",
  lot: "Lote",
  warehouse: "Bodega",
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function PropertyDetailPage({
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

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${property.slug}`
  const typeLabel = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(Number(property.price))
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")

  const hasDetails =
    property.area != null ||
    property.bedrooms != null ||
    property.bathrooms != null ||
    property.parking != null

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-3xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-slate-950 tracking-tight">
            {property.published ? "Propiedad publicada" : "Propiedad desactivada"}
          </h1>
          <p className="text-sm text-slate-500 truncate">{property.title}</p>
        </div>
        <PropertyActions propertyId={property.id} initialPublished={property.published} />
      </div>

      {/* Banner de desactivada */}
      {!property.published && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
          <EyeOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">
            El link público no está disponible mientras la propiedad esté desactivada.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <SharePanel url={publicUrl} title={property.title} propertyId={property.id} />

        {/* Carrusel */}
        {property.images.length > 0 && (
          <PropertyCarousel images={property.images} title={property.title} />
        )}

        {/* Resumen */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center bg-brand-50 text-brand-700 text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                {typeLabel} · En venta
              </span>
              <h2 className="text-xl font-black text-slate-950 tracking-tight leading-tight mb-1">
                {property.title}
              </h2>
              {location && (
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{location}</span>
                </div>
              )}
            </div>
            <p className="text-2xl font-black text-slate-950 tracking-tighter flex-shrink-0">{price}</p>
          </div>

          {hasDetails && (
            <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
              {property.area != null && (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Square className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                  <span className="font-semibold">{property.area} m²</span>
                </div>
              )}
              {property.bedrooms != null && (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <BedDouble className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                  <span className="font-semibold">{property.bedrooms} hab.</span>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Bath className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                  <span className="font-semibold">{property.bathrooms} baños</span>
                </div>
              )}
              {property.parking != null && (
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Car className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                  <span className="font-semibold">{property.parking} parqueaderos</span>
                </div>
              )}
            </div>
          )}
        </div>

        {property.description && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Descripción</p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
