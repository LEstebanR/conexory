import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { MapPin, BedDouble, Bath, Ruler, Car, LandPlot, ShieldCheck, EyeOff, ArrowUpRight, Phone, Mail, MessageCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getAppUrl } from "@/lib/urls"
import { youtubeId } from "@/lib/youtube"
import { PROPERTY_TYPE_LABELS as TYPE_LABELS, TRANSACTION_TYPE_LABELS } from "@/lib/property-types"
import PublicGallery from "@/components/public-gallery"
import Reveal from "@/components/reveal"
import PropertyMap from "@/components/property-map-client"

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
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ c?: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { c } = await searchParams
  const property = await prisma.property.findUnique({ where: { slug } })
  if (!property) return { title: "Propiedad no encontrada" }

  const type = TYPE_LABELS[property.type] ?? property.type
  const location = [property.neighborhood, property.city, property.state].filter(Boolean).join(", ")

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

  const description = features || "Mira las fotos y la información completa."
  const ogTitle = `${type}${location ? ` en ${location}` : ""}`
  const ogImage = {
    url: `/p/${slug}/og.jpg`,
    width: 1200,
    height: 630,
    alt: "Propiedad en Conexory",
  }

  const meta: Metadata = {
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

  if (c === "0") {
    return {
      ...meta,
      robots: { index: false, follow: false },
      alternates: { canonical: `/p/${slug}` },
    }
  }

  return meta
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

function AgentCard({
  user,
  whatsappMessage,
}: {
  user: {
    name: string
    email: string
    image: string | null
    location: string | null
    bio: string | null
    phone: string | null
    phoneIsWhatsapp: boolean
  }
  whatsappMessage: string
}) {
  return (
    <div className="bg-white border border-hairline rounded-2xl p-6 space-y-5">
      <p className="text-xs font-bold text-mute uppercase tracking-widest">Asesor</p>

      <div className="flex items-center gap-3">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-ink flex items-center justify-center text-white text-sm font-black flex-shrink-0 select-none">
            {user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-black text-ink tracking-tight leading-tight">{user.name}</p>
          {user.location && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-mute flex-shrink-0" strokeWidth={2} />
              <span className="text-xs text-mute truncate">{user.location}</span>
            </div>
          )}
        </div>
      </div>

      {user.bio && (
        <p className="text-sm text-body leading-relaxed">{user.bio}</p>
      )}

      <div className="flex flex-col gap-2">
        {user.phone && user.phoneIsWhatsapp && (
          <a
            href={`https://wa.me/${user.phone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-[#25D366] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={2} />
            WhatsApp
          </a>
        )}
        {user.phone && (
          <a
            href={`tel:${user.phone}`}
            className="w-full flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-ink text-white text-sm font-bold hover:bg-elevated transition-colors"
          >
            <Phone className="w-4 h-4" strokeWidth={2} />
            Llamar
          </a>
        )}
        <a
          href={`mailto:${user.email}`}
          className="w-full flex items-center justify-center gap-2 h-11 px-5 rounded-full border border-hairline-strong bg-white text-sm font-semibold text-ink hover:bg-canvas-soft transition-colors"
        >
          <Mail className="w-4 h-4 text-mute" strokeWidth={2} />
          Correo
        </a>
      </div>
    </div>
  )
}

export default async function PublicPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ c?: string }>
}) {
  const { slug } = await params
  const { c } = await searchParams
  const hideContact = c === "0"

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
  const location = [property.neighborhood, property.city, property.state].filter(Boolean).join(", ")
  const transactionLabel = property.transactionType
    ? TRANSACTION_TYPE_LABELS[property.transactionType] ?? null
    : null

  const propertyUrl = `${getAppUrl()}/p/${property.slug}`
  const whatsappMessage = `Hola, estoy interesado en esta propiedad: ${property.title}\n${propertyUrl}`

  const stats = [
    property.area != null && { icon: Ruler, value: property.area, label: "m²" },
    property.landArea != null && { icon: LandPlot, value: property.landArea, label: "m² lote" },
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

  const showContactCard = property.showContact && !hideContact

  return (
    <div className="min-h-screen bg-canvas flex flex-col">

      {/* Gallery — edge-to-edge on mobile, wider container on desktop when sidebar is shown */}
      {(property.images.length > 0 || videoId) && (
        <div className={`w-full sm:mx-auto sm:px-4 sm:pt-5 ${showContactCard ? "sm:max-w-5xl" : "sm:max-w-2xl"}`}>
          <PublicGallery
            images={property.images}
            title={property.title}
            videoId={videoId}
            className="sm:rounded-2xl"
          />
        </div>
      )}

      <main className={`flex-1 w-full mx-auto px-4 pt-5 pb-8 ${showContactCard ? "max-w-5xl" : "max-w-2xl"}`}>
        <div className="lg:flex lg:items-start lg:gap-8">

          {/* Left column: property info */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* Headline + price */}
            <Reveal>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-mute mb-1.5">
                    {typeLabel}{transactionLabel ? ` · ${transactionLabel}` : ""}
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
                  {property.gatedCommunity && (
                    <div className="inline-flex items-center gap-1.5 mt-3 bg-canvas-soft text-ink text-xs font-semibold px-2.5 py-1 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                      Unidad cerrada
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

            {/* Map */}
            {property.latitude != null && property.longitude != null && (
              <Reveal delay={180}>
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  label={location || undefined}
                />
              </Reveal>
            )}

            {/* Contact card — mobile only (below all content) */}
            {showContactCard && (
              <div className="lg:hidden">
                <Reveal delay={200}>
                  <AgentCard user={property.user} whatsappMessage={whatsappMessage} />
                </Reveal>
              </div>
            )}

          </div>

          {/* Right sidebar: contact card — desktop only, sticky */}
          {showContactCard && (
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-6">
                <AgentCard user={property.user} whatsappMessage={whatsappMessage} />
              </div>
            </aside>
          )}

        </div>
      </main>

      <PageFooter />
    </div>
  )
}
