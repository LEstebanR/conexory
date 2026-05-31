import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { Building2, MapPin, BedDouble, Bath, Square, Car } from "lucide-react"
import { prisma } from "@/lib/prisma"

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const property = await prisma.property.findUnique({ where: { slug } })
  if (!property) return { title: "Propiedad no encontrada — MiAgente" }

  const type = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(Number(property.price))
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")

  return {
    title: `${property.title} — MiAgente`,
    description: `${type} en venta${location ? ` en ${location}` : ""}. Precio: ${price}.`,
    openGraph: {
      title: property.title,
      description: `${type} · ${price}${location ? ` · ${location}` : ""}`,
      siteName: "MiAgente",
    },
  }
}

export default async function PublicPropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const property = await prisma.property.findUnique({
    where: { slug },
  })

  if (!property || !property.published) notFound()

  const typeLabel = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(Number(property.price))
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")

  const hasDetails =
    property.area != null ||
    property.bedrooms != null ||
    property.bathrooms != null ||
    property.parking != null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-7 h-7 rounded-lg bg-brand-400 flex items-center justify-center shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-black text-slate-950 tracking-tight">MiAgente</span>
        </Link>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-4">
        {/* Imágenes */}
        {property.images.length > 0 && (
          <div className="rounded-2xl overflow-hidden space-y-1 -mx-4 sm:mx-0">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full aspect-video object-cover"
            />
            {property.images.length > 1 && (
              <div className="flex gap-1 overflow-x-auto pb-0.5">
                {property.images.slice(1).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="h-20 w-20 flex-shrink-0 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center bg-brand-50 text-brand-700 text-xs font-bold px-3 py-1.5 rounded-full">
            {typeLabel} · En venta
          </span>
        </div>

        {/* Title + location */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight mb-2">
            {property.title}
          </h1>
          {location && (
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Precio</p>
          <p className="text-3xl font-black text-slate-950 tracking-tighter">{price}</p>
        </div>

        {/* Details */}
        {hasDetails && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Detalles</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {property.area != null && (
                <div className="flex flex-col gap-1.5">
                  <Square className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                  <p className="text-xl font-black text-slate-950">{property.area}</p>
                  <p className="text-xs text-slate-400 font-medium">m²</p>
                </div>
              )}
              {property.bedrooms != null && (
                <div className="flex flex-col gap-1.5">
                  <BedDouble className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                  <p className="text-xl font-black text-slate-950">{property.bedrooms}</p>
                  <p className="text-xs text-slate-400 font-medium">Habitaciones</p>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="flex flex-col gap-1.5">
                  <Bath className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                  <p className="text-xl font-black text-slate-950">{property.bathrooms}</p>
                  <p className="text-xs text-slate-400 font-medium">Baños</p>
                </div>
              )}
              {property.parking != null && (
                <div className="flex flex-col gap-1.5">
                  <Car className="w-4 h-4 text-slate-400" strokeWidth={1.75} />
                  <p className="text-xl font-black text-slate-950">{property.parking}</p>
                  <p className="text-xs text-slate-400 font-medium">Parqueaderos</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {property.description && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Descripción</p>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-5 px-4 text-center">
        <p className="text-xs text-slate-400">
          Publicado con{" "}
          <Link href="/" className="text-brand-500 font-semibold hover:underline">
            MiAgente
          </Link>
        </p>
      </footer>
    </div>
  )
}
