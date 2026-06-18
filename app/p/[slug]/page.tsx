import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import {
  MapPin,
  BedDouble,
  Bath,
  Square,
  Car,
  EyeOff,
  ArrowRight,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import PublicGallery from "@/components/public-gallery"
import PublicShareButton from "@/components/public-share-button"
import Reveal from "@/components/reveal"

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

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
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
  if (!property) return { title: "Propiedad no encontrada" }

  const type = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(Number(property.price))
  const location = [property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ")

  const description = [
    `Te comparto este ${type.toLowerCase()}${location ? ` en ${location}` : ""}:`,
    `• Precio: ${price}`,
    property.area != null ? `• ${property.area} m²` : null,
    property.bedrooms != null ? `• ${property.bedrooms} Habitaciones` : null,
    property.bathrooms != null ? `• ${property.bathrooms} Baños` : null,
    property.parking != null ? `• ${property.parking} Parqueaderos` : null,
    `Ofrece: ${property.user.name}`,
  ]
    .filter(Boolean)
    .join("\n")

  const ogTitle = `${type}${location ? ` en ${location}` : ""} · ${price}`

  return {
    title: `${type}${location ? ` en ${location}` : ""}`,
    description,
    openGraph: {
      type: "website",
      url: `/p/${slug}`,
      title: ogTitle,
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
    include: { user: { select: { name: true, image: true } } },
  })

  if (!property) notFound()

  if (!property.published) {
    return (
      <div className="min-h-screen bg-canvas-softer flex flex-col">
        <header className="bg-white border-b border-hairline px-4 sm:px-6 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center shadow-sm">
              <Image
                src="/mark-white.png"
                alt="Conexory"
                width={18}
                height={18}
                className="w-4.5 h-4.5"
              />
            </div>
            <span className="text-sm font-black text-ink tracking-tight">
              Conexory
            </span>
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
            Esta propiedad fue desactivada temporalmente por el agente. Es
            posible que ya no esté disponible.
          </p>
        </main>

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

  const typeLabel = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(Number(property.price))
  const location = [property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ")

  const stats = [
    property.area != null && {
      icon: Square,
      value: property.area,
      label: "m²",
    },
    property.bedrooms != null && {
      icon: BedDouble,
      value: property.bedrooms,
      label: property.bedrooms === 1 ? "Habitación" : "Habitaciones",
    },
    property.bathrooms != null && {
      icon: Bath,
      value: property.bathrooms,
      label: property.bathrooms === 1 ? "Baño" : "Baños",
    },
    property.parking != null && {
      icon: Car,
      value: property.parking,
      label: property.parking === 1 ? "Parqueadero" : "Parqueaderos",
    },
  ].filter(Boolean) as { icon: typeof Square; value: number; label: string }[]

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-canvas/80 backdrop-blur-md border-b border-hairline">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center shadow-sm">
              <Image
                src="/mark-white.png"
                alt="Conexory"
                width={18}
                height={18}
                className="w-4.5 h-4.5"
              />
            </div>
            <span className="text-sm font-black text-ink tracking-tight">
              Conexory
            </span>
          </Link>
          <PublicShareButton slug={slug} title={property.title} />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Gallery */}
        {property.images.length > 0 && (
          <Reveal>
            <PublicGallery images={property.images} title={property.title} />
          </Reveal>
        )}

        {/* Headline + price */}
        <Reveal delay={60}>
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center bg-canvas-soft text-ink text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                {typeLabel}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight leading-tight">
                {property.title}
              </h1>
              {location && (
                <div className="flex items-center gap-1.5 text-body text-sm mt-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
                  <span>{location}</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <p className="text-3xl sm:text-4xl font-black text-ink tracking-tighter">
                {price}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Stats */}
        {stats.length > 0 && (
          <Reveal delay={120}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {stats.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="bg-canvas-softer rounded-2xl p-4 flex flex-col gap-2"
                >
                  <Icon className="w-5 h-5 text-mute" strokeWidth={1.75} />
                  <div>
                    <p className="text-xl font-black text-ink leading-none">
                      {value}
                    </p>
                    <p className="text-xs text-body font-medium mt-1">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Description */}
        {property.description && (
          <Reveal delay={160}>
            <div>
              <h2 className="text-xs font-bold text-mute uppercase tracking-wide mb-3">
                Descripción
              </h2>
              <p className="text-[15px] text-body leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          </Reveal>
        )}

        {/* Agent */}
        <Reveal delay={200}>
          <div className="flex items-center gap-3 bg-canvas-softer rounded-2xl p-4">
            {property.user.image ? (
              <Image
                src={property.user.image}
                alt={property.user.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-black text-white">
                  {initials(property.user.name)}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs text-mute font-semibold uppercase tracking-wide">
                Ofrecido por
              </p>
              <p className="text-sm font-bold text-ink truncate">
                {property.user.name}
              </p>
            </div>
          </div>
        </Reveal>

        {/* Marketing CTA */}
        <Reveal delay={240}>
          <Link
            href="/"
            className="group block bg-ink rounded-2xl sm:rounded-3xl p-6 sm:p-8 overflow-hidden"
          >
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
              ¿Eres agente inmobiliario?
            </p>
            <p className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug mb-4 max-w-sm">
              Crea fichas como esta y compártelas por WhatsApp en segundos.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white">
              Pruébalo gratis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </Reveal>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline py-5 px-4 text-center">
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
