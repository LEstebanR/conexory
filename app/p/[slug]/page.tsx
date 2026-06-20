import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { MapPin, BedDouble, Bath, Ruler, Car, EyeOff, ArrowUpRight, Phone, Mail, MessageCircle } from "lucide-react"
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
  const property = await prisma.property.findUnique({ where: { slug } })
  if (!property) return { title: "Propiedad no encontrada" }

  const type = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(Number(property.price))
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")

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


function PageFooter() {
  return (
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
  )
}

export default async function PublicPropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      user: {
        select: { name: true, email: true, image: true, location: true, bio: true, phone: true, phoneIsWhatsapp: true },
      },
    },
  })

  if (!property) notFound()

  const typeLabel = TYPE_LABELS[property.type] ?? property.type

  if (!property.published) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col">
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
        <PageFooter />
      </div>
    )
  }

  const price = formatCOP(Number(property.price))
  const videoId = youtubeId(property.videoUrl)
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")

  const stats = [
    property.area != null && { icon: Ruler, value: property.area, label: "m²" },
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
  ].filter(Boolean) as { icon: typeof Ruler; value: number; label: string }[]

  return (
    <div className="min-h-screen bg-canvas flex flex-col">

      {/* Gallery — edge-to-edge on mobile */}
      {(property.images.length > 0 || videoId) && (
        <div className="w-full sm:max-w-2xl sm:mx-auto sm:px-4 sm:pt-5">
          <PublicGallery
            images={property.images}
            title={property.title}
            videoId={videoId}
            className="sm:rounded-2xl"
          />
        </div>
      )}

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pt-5 pb-8 space-y-6">
        {/* Headline + price */}
        <Reveal>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-mute mb-1.5">
                {typeLabel}
              </p>
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
            <p className="text-4xl sm:text-5xl font-black text-ink tracking-tighter">
              {price}
            </p>
          </div>
        </Reveal>

        {/* Stats — horizontal row */}
        {stats.length > 0 && (
          <Reveal delay={80}>
            <div className="flex items-center divide-x divide-hairline border-y border-hairline -mx-4 sm:mx-0 sm:rounded-2xl sm:border">
              {stats.map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex-1 flex flex-col items-center py-4 gap-1 min-w-0"
                >
                  <Icon className="w-4 h-4 text-mute" strokeWidth={1.75} />
                  <p className="text-lg font-black text-ink leading-none">{value}</p>
                  <p className="text-[11px] text-mute font-medium truncate px-1">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Description */}
        {property.description && (
          <Reveal delay={140}>
            <div>
              <h2 className="text-xs font-bold text-mute uppercase tracking-widest mb-3">
                Descripción
              </h2>
              <p className="text-[15px] text-body leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>
          </Reveal>
        )}

        {/* Agent contact — only shown when explicitly enabled per property */}
        {property.showContact && (
          <Reveal delay={200}>
            <div className="bg-canvas-softer rounded-2xl p-5 space-y-5">
              <h2 className="text-xs font-bold text-mute uppercase tracking-widest">
                Asesor
              </h2>

              {/* Identity */}
              <div className="flex items-center gap-4">
                {property.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={property.user.image}
                    alt={property.user.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-ink flex items-center justify-center text-white text-lg font-black flex-shrink-0 select-none">
                    {property.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-base font-black text-ink tracking-tight leading-tight">
                    {property.user.name}
                  </p>
                  {property.user.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-mute flex-shrink-0" strokeWidth={2} />
                      <span className="text-xs text-mute truncate">{property.user.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {property.user.bio && (
                <p className="text-sm text-body leading-relaxed">{property.user.bio}</p>
              )}

              {/* CTAs — full-width on mobile, auto-width on desktop */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                {property.user.phone && (
                  property.user.phoneIsWhatsapp ? (
                    <a
                      href={`https://wa.me/${property.user.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#25D366] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                      <MessageCircle className="w-4 h-4" strokeWidth={2} />
                      Escribir por WhatsApp
                    </a>
                  ) : (
                    <a
                      href={`tel:${property.user.phone}`}
                      className="flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-ink text-white text-sm font-bold hover:bg-elevated transition-colors"
                    >
                      <Phone className="w-4 h-4" strokeWidth={2} />
                      Llamar · {property.user.phone}
                    </a>
                  )
                )}
                <a
                  href={`mailto:${property.user.email}`}
                  className="flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-hairline-strong bg-white text-sm font-semibold text-ink hover:bg-canvas-soft transition-colors"
                >
                  <Mail className="w-4 h-4 text-mute" strokeWidth={2} />
                  {property.user.email}
                </a>
              </div>
            </div>
          </Reveal>
        )}

      </main>

      <PageFooter />
    </div>
  )
}
