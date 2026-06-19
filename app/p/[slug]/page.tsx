import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { MapPin, BedDouble, Bath, Square, Car, EyeOff, ArrowUpRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { youtubeId } from "@/lib/youtube"
import PublicGallery from "@/components/public-gallery"
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const property = await prisma.property.findUnique({
    where: { slug },
  })
  if (!property) return { title: "Propiedad no encontrada" }

  const type = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(Number(property.price))
  const location = [property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ")

  const features = [
    property.bedrooms != null
      ? `${property.bedrooms} ${property.bedrooms === 1 ? "habitación" : "habitaciones"}`
      : null,
    property.bathrooms != null
      ? `${property.bathrooms} ${property.bathrooms === 1 ? "baño" : "baños"}`
      : null,
    property.area != null ? `${property.area} m²` : null,
    property.parking != null
      ? `${property.parking} ${property.parking === 1 ? "parqueadero" : "parqueaderos"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const description = [price, features].filter(Boolean).join(" · ")

  const ogTitle = `${type}${location ? ` en ${location}` : ""} · ${price}`

  // og:image points at the clean /p/[slug]/og.jpg route (resolved to an
  // absolute URL via metadataBase). A real .jpg URL is more reliable for
  // WhatsApp than the hashed, extension-less opengraph-image route.
  const ogImage = {
    url: `/p/${slug}/og.jpg`,
    width: 1200,
    height: 630,
    alt: "Propiedad en Conexory",
  }

  return {
    title: `${type}${location ? ` en ${location}` : ""}`,
    description,
    openGraph: {
      type: "website",
      url: `/p/${slug}`,
      title: ogTitle,
      description,
      siteName: "Conexory",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [`/p/${slug}/og.jpg`],
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
  const videoId = youtubeId(property.videoUrl)
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
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6">
        {/* Gallery */}
        {(property.images.length > 0 || videoId) && (
          <Reveal>
            <PublicGallery
              images={property.images}
              title={property.title}
              videoId={videoId}
            />
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
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline mt-2">
        <Link
          href="/"
          className="group flex items-center justify-center gap-2.5 py-6 px-4 hover:bg-canvas-softer transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <Image
              src="/mark-white.png"
              alt="Conexory"
              width={20}
              height={20}
              className="w-5 h-5"
            />
          </div>
          <div className="leading-tight">
            <p className="text-[11px] text-mute font-medium">Publicado con</p>
            <p className="inline-flex items-center gap-0.5 text-sm font-black text-ink tracking-tight">
              Conexory
              <ArrowUpRight className="w-3.5 h-3.5 text-mute transition-all group-hover:text-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </p>
          </div>
        </Link>
      </footer>
    </div>
  )
}
