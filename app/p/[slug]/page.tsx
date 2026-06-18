import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { MapPin, BedDouble, Bath, Square, Car, EyeOff } from "lucide-react"
import { prisma } from "@/lib/prisma"
import PropertyCarousel from "@/components/property-carousel"

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
  const property = await prisma.property.findUnique({
    where: { slug },
    include: { user: { select: { name: true } } },
  })
  if (!property) return { title: "Propiedad no encontrada — Conexory" }

  const type = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(Number(property.price))
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")

  const description = [
    `Te ofrezco ${type}${location ? ` en ${location}` : ""}:`,
    `• Precio: ${price}`,
    property.area != null ? `• ${property.area} m²` : null,
    property.bedrooms != null ? `• ${property.bedrooms} Habitaciones` : null,
    property.bathrooms != null ? `• ${property.bathrooms} Baños` : null,
    property.parking != null ? `• ${property.parking} Parqueaderos` : null,
    `Ofrece: ${property.user.name}`,
  ].filter(Boolean).join("\n")

  return {
    title: `${type} en venta${location ? ` en ${location}` : ""} — Conexory`,
    description,
    openGraph: {
      type: "website",
      url: `/p/${slug}`,
      title: `${type} en venta`,
      description,
      siteName: "Conexory",
      images: property.images[0] ? [{ url: property.images[0] }] : undefined,
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

  if (!property) notFound()

  if (!property.published) {
    return (
      <div className="min-h-screen bg-canvas-softer flex flex-col">
        <header className="bg-white border-b border-hairline px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center shadow-sm">
              <Image src="/mark-white.png" alt="Conexory" width={18} height={18} className="w-4.5 h-4.5" />
            </div>
            <span className="text-sm font-black text-ink tracking-tight">Conexory</span>
          </Link>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-canvas-soft flex items-center justify-center mb-6">
            <EyeOff className="w-9 h-9 text-mute" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-black text-ink tracking-tight mb-2">
            Propiedad no disponible
          </h1>
          <p className="text-body text-sm leading-relaxed max-w-xs">
            Esta propiedad fue desactivada temporalmente por el agente. Es posible que ya no esté disponible.
          </p>
        </main>

        <footer className="border-t border-hairline bg-white py-5 px-4 text-center">
          <p className="text-xs text-mute">
            Publicado con{" "}
            <Link href="/" className="text-ink font-semibold hover:underline">Conexory</Link>
          </p>
        </footer>
      </div>
    )
  }

  const typeLabel = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(Number(property.price))
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")

  const hasDetails =
    property.area != null ||
    property.bedrooms != null ||
    property.bathrooms != null ||
    property.parking != null

  return (
    <div className="min-h-screen bg-canvas-softer flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-4">
        {/* Carrusel de imágenes */}
        {property.images.length > 0 && (
          <PropertyCarousel images={property.images} title={property.title} />
        )}

        {/* Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center bg-canvas-soft text-ink text-xs font-bold px-3 py-1.5 rounded-full">
            {typeLabel} · En venta
          </span>
        </div>

        {/* Title + location */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight leading-tight mb-2">
            {property.title}
          </h1>
          {location && (
            <div className="flex items-center gap-1.5 text-body text-sm">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="bg-white rounded-2xl border border-hairline p-6">
          <p className="text-xs font-bold text-mute uppercase tracking-wide mb-1">Precio</p>
          <p className="text-3xl font-black text-ink tracking-tighter">{price}</p>
        </div>

        {/* Details */}
        {hasDetails && (
          <div className="bg-white rounded-2xl border border-hairline p-6">
            <p className="text-xs font-bold text-mute uppercase tracking-wide mb-4">Detalles</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {property.area != null && (
                <div className="flex flex-col gap-1.5">
                  <Square className="w-4 h-4 text-mute" strokeWidth={1.75} />
                  <p className="text-xl font-black text-ink">{property.area}</p>
                  <p className="text-xs text-mute font-medium">m²</p>
                </div>
              )}
              {property.bedrooms != null && (
                <div className="flex flex-col gap-1.5">
                  <BedDouble className="w-4 h-4 text-mute" strokeWidth={1.75} />
                  <p className="text-xl font-black text-ink">{property.bedrooms}</p>
                  <p className="text-xs text-mute font-medium">Habitaciones</p>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="flex flex-col gap-1.5">
                  <Bath className="w-4 h-4 text-mute" strokeWidth={1.75} />
                  <p className="text-xl font-black text-ink">{property.bathrooms}</p>
                  <p className="text-xs text-mute font-medium">Baños</p>
                </div>
              )}
              {property.parking != null && (
                <div className="flex flex-col gap-1.5">
                  <Car className="w-4 h-4 text-mute" strokeWidth={1.75} />
                  <p className="text-xl font-black text-ink">{property.parking}</p>
                  <p className="text-xs text-mute font-medium">Parqueaderos</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {property.description && (
          <div className="bg-white rounded-2xl border border-hairline p-6">
            <p className="text-xs font-bold text-mute uppercase tracking-wide mb-3">Descripción</p>
            <p className="text-sm text-body leading-relaxed whitespace-pre-wrap">
              {property.description}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline bg-white py-5 px-4 text-center">
        <p className="text-xs text-mute">
          Publicado con{" "}
          <Link href="/" className="text-ink font-semibold hover:underline">
            Conexory
          </Link>
        </p>
      </footer>
    </div>
  )
}
