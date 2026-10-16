import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { MapPin, BedDouble, Bath, Ruler, Car, LandPlot, ShieldCheck, MessageCircle } from "lucide-react"
import { listingOffer } from "@/lib/listing-seo"
import { getPublicProperty } from "@/lib/public-pages"
import { getAppUrl } from "@/lib/urls"
import { youtubeId } from "@/lib/youtube"
import {
  PROPERTY_TYPE_LABELS as TYPE_LABELS,
  PROPERTY_TYPE_LABELS_EN as TYPE_LABELS_EN,
  TRANSACTION_TYPE_LABELS_EN as TRANSACTION_LABELS_EN,
  TRANSACTION_TYPE_PHRASES,
} from "@/lib/property-types"
import { formatCOP } from "@/lib/format"
import PublicGallery from "@/components/public-gallery"
import PropertyVideo from "@/components/property-video"
import Reveal from "@/components/reveal"
import PropertyMap from "@/components/property-map-client"
import ContactButtons from "./contact-buttons"
import SocialLinkButton from "./social-link-button"
import ContactBar from "./contact-bar"
import TrackVisit from "./track-visit"


// ── Social icon SVGs (same as agent page) ─────────────────────────────────

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.97a8.19 8.19 0 0 0 4.78 1.52V7.03a4.85 4.85 0 0 1-1.01-.34z" />
    </svg>
  )
}
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  )
}

// ── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ c?: string; lang?: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { c, lang } = await searchParams
  // A throw here never reaches error.tsx — Next falls back to the not-found
  // metadata, so a DB blip would title the page "Propiedad no encontrada" and
  // tell the visitor (and Google) that a live listing is gone. Degrade to the
  // layout defaults instead and let the page render surface the real failure.
  const property = await getPublicProperty(slug).catch(() => undefined)
  if (property === undefined) return {}
  if (!property || !property.published) notFound()

  const english = lang === "en" && property.englishAvailable
  const type = (english ? TYPE_LABELS_EN : TYPE_LABELS)[property.type] ?? property.type

  const location = [property.neighborhood, property.city, property.state].filter(Boolean).join(", ")

  const features = [
    property.bedrooms != null
      ? `${property.bedrooms} ${english ? property.bedrooms === 1 ? "bedroom" : "bedrooms" : property.bedrooms === 1 ? "habitación" : "habitaciones"}`
      : null,
    property.bathrooms != null
      ? `${property.bathrooms} ${english ? property.bathrooms === 1 ? "bathroom" : "bathrooms" : property.bathrooms === 1 ? "baño" : "baños"}`
      : null,
    property.area != null ? `${property.area} m²` : null,
    property.parking != null
      ? `${property.parking} ${english ? property.parking === 1 ? "parking space" : "parking spaces" : property.parking === 1 ? "parqueadero" : "parqueaderos"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const price = `${formatCOP(property.price)}${priceSuffix(property.transactionType, english)}`
  const reachableOnWhatsapp =
    c !== "0" && property.showContact && !!property.user.phone && property.user.phoneIsWhatsapp
  const descParts = [
    `${type}${location ? english ? ` in ${location}` : ` en ${location}` : ""}`,
    price,
    features || null,
    reachableOnWhatsapp
      ? english ? "Contact the agent directly by WhatsApp." : "Contacta al asesor directamente por WhatsApp."
      : null,
  ].filter(Boolean)
  const description = descParts.join(". ")

  const ogTitle = `${type}${location ? english ? ` in ${location}` : ` en ${location}` : ""} — ${price}`
  const listingTitle = english ? property.titleEn ?? property.title : property.title
  const ogQuery = new URLSearchParams({ ...(english && { lang: "en" }), ...(c === "0" && { c: "0" }) }).toString()
  const ogImageUrl = `/p/${slug}/og.jpg${ogQuery ? `?${ogQuery}` : ""}`
  const ogImage = {
    url: ogImageUrl,
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt: listingTitle,
  }

  const meta: Metadata = {
    title: ogTitle,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `/p/${slug}${english ? "?lang=en" : ""}` },
    openGraph: {
      type: "website",
      url: `/p/${slug}${english ? "?lang=en" : ""}`,
      title: ogTitle,
      description,
      locale: english ? "en_US" : "es_CO",
      siteName: "Conexory",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [ogImageUrl],
    },
  }

  if (c === "0") {
    return { ...meta, robots: { index: false, follow: false } }
  }

  return meta
}

// ── Footer ─────────────────────────────────────────────────────────────────

function PageFooter({ english }: { english: boolean }) {
  return (
    <footer className="border-t border-hairline">
      <Link
        href="/"
        className="flex items-center justify-center gap-2 py-5 px-4 text-xs text-body hover:text-ink transition-colors"
      >
        <Image src="/mark-black.png" alt="" width={14} height={14} className="h-3.5 w-3.5" />
        {english ? "Listing made with Conexory" : "Ficha creada con Conexory"}
      </Link>
    </footer>
  )
}

function priceSuffix(transactionType: string | null, english: boolean): string {
  if (transactionType !== "rent" && transactionType !== "rent_furnished") return ""
  return english ? " / month" : " / mes"
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function AgentAvatar({ user, size }: { user: AgentUser; size: number }) {
  return user.image ? (
    <Image
      src={user.image}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-ink font-bold text-white select-none"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {initialsOf(user.name)}
    </span>
  )
}

// ── Agent card (mirrors agent profile page design) ─────────────────────────

type AgentUser = {
  name: string
  email: string
  image: string | null
  location: string | null
  bio: string | null
  phone: string | null
  phoneIsWhatsapp: boolean
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  linkedin: string | null
  youtube: string | null
  bioEn: string | null
}

function AgentCard({ propertyId, user, whatsappMessage, english }: { propertyId: string; user: AgentUser; whatsappMessage: string; english: boolean }) {
  const socialLinks = [
    { handle: user.instagram, href: `https://instagram.com/${user.instagram}`,   label: "Instagram", Icon: InstagramIcon, eventType: "social_instagram_click" },
    { handle: user.tiktok,    href: `https://tiktok.com/@${user.tiktok}`,         label: "TikTok",    Icon: TikTokIcon,    eventType: "social_tiktok_click" },
    { handle: user.facebook,  href: `https://facebook.com/${user.facebook}`,      label: "Facebook",  Icon: FacebookIcon,  eventType: "social_facebook_click" },
    { handle: user.linkedin,  href: `https://linkedin.com/in/${user.linkedin}`,   label: "LinkedIn",  Icon: LinkedInIcon,  eventType: "social_linkedin_click" },
    { handle: user.youtube,   href: `https://youtube.com/@${user.youtube}`,       label: "YouTube",   Icon: YouTubeIcon,   eventType: "social_youtube_click" },
  ].filter(({ handle }) => !!handle)

  const hasSocial = socialLinks.length > 0

  return (
    <div className="bg-white border border-hairline rounded-2xl p-6">
      <div className="flex flex-col items-center text-center mb-4">
        <AgentAvatar user={user} size={72} />
        <h2 className="mt-4 text-lg font-bold text-ink leading-tight">{user.name}</h2>
        {user.location && (
          <p className="flex items-center justify-center gap-1 mt-1 text-sm text-body">
            <MapPin className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>{user.location}</span>
          </p>
        )}
      </div>

      {(english ? user.bioEn ?? user.bio : user.bio) && (
        <p className="text-sm text-body leading-relaxed text-center mb-4">{english ? user.bioEn ?? user.bio : user.bio}</p>
      )}

      {hasSocial && (
        <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
          {socialLinks.map(({ href, label, Icon, eventType }) => (
            <SocialLinkButton key={label} propertyId={propertyId} href={href} label={label} eventType={eventType}>
              <Icon className="w-4 h-4" />
            </SocialLinkButton>
          ))}
        </div>
      )}

      <div className="border-t border-hairline mb-4" />

      <ContactButtons
        propertyId={propertyId}
        phone={user.phone}
        phoneIsWhatsapp={user.phoneIsWhatsapp}
        email={user.email}
        whatsappMessage={whatsappMessage}
        english={english}
      />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function PublicPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ c?: string; lang?: string }>
}) {
  const { slug } = await params
  const { c, lang } = await searchParams
  const hideContact = c === "0"

  const property = await getPublicProperty(slug)

  if (!property || !property.published) notFound()

  const english = lang === "en" && property.englishAvailable
  const title = english ? property.titleEn ?? property.title : property.title
  const description = english ? property.descriptionEn ?? property.description : property.description

  const typeLabel = (english ? TYPE_LABELS_EN : TYPE_LABELS)[property.type] ?? property.type

  const price = formatCOP(property.price)
  const suffix = priceSuffix(property.transactionType, english)
  const previousPrice =
    property.previousPrice != null && property.previousPrice > property.price
      ? formatCOP(property.previousPrice)
      : null
  const priceReduced = previousPrice != null
  const videoId = youtubeId(property.videoUrl)
  const location = [property.neighborhood, property.city, property.state].filter(Boolean).join(", ")

  const propertyUrl = `${getAppUrl()}/p/${property.slug}`
  const whatsappMessage = english
    ? `Hello, I'm interested in this property: ${title}\n${propertyUrl}?lang=en`
    : `Hola, me interesa esta propiedad: ${title}\n${propertyUrl}`

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: title,
    description: description ?? undefined,
    url: `${propertyUrl}${english ? "?lang=en" : ""}`,
    datePosted: property.createdAt,
    ...(property.images.length > 0 && { image: property.images }),
    offers: listingOffer(property.transactionType, property.price),
    address: {
      "@type": "PostalAddress",
      ...(property.city && { addressLocality: property.city }),
      ...(property.state && { addressRegion: property.state }),
      addressCountry: "CO",
    },
    ...(property.bedrooms != null && { numberOfRooms: property.bedrooms }),
    ...(property.area != null && {
      floorSize: {
        "@type": "QuantitativeValue",
        value: property.area,
        unitCode: "MTK",
      },
    }),
  }

  const stats = [
    property.area != null && { icon: Ruler, value: property.area, unit: "m²", label: english ? "Area" : "Área" },
    property.landArea != null && { icon: LandPlot, value: property.landArea, unit: "m²", label: english ? "Lot" : "Lote" },
    property.bedrooms != null && {
      icon: BedDouble,
      value: property.bedrooms,
      label: english ? property.bedrooms === 1 ? "Bedroom" : "Bedrooms" : property.bedrooms === 1 ? "Habitación" : "Habitaciones",
    },
    property.bathrooms != null && {
      icon: Bath,
      value: property.bathrooms,
      label: english ? property.bathrooms === 1 ? "Bathroom" : "Bathrooms" : property.bathrooms === 1 ? "Baño" : "Baños",
    },
    property.parking != null && {
      icon: Car,
      value: property.parking,
      label: english ? property.parking === 1 ? "Parking space" : "Parking spaces" : property.parking === 1 ? "Parqueadero" : "Parqueaderos",
    },
  ].filter(Boolean) as { icon: typeof Ruler; value: number; unit?: string; label: string }[]

  const showContactCard = property.showContact && !hideContact

  const offerPhrase = property.transactionType
    ? english
      ? TRANSACTION_LABELS_EN[property.transactionType]?.toLowerCase()
      : TRANSACTION_TYPE_PHRASES[property.transactionType]
    : null
  const offerLine = [typeLabel, offerPhrase].filter(Boolean).join(" ")

  return (
    <div className={`min-h-screen bg-canvas flex flex-col${showContactCard ? " pb-[76px] xl:pb-0" : ""}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex-1 w-full xl:max-w-6xl xl:mx-auto xl:px-6 xl:grid xl:grid-cols-[minmax(0,42rem)_18rem] xl:justify-center xl:gap-12">
        <div className="min-w-0">
          {property.images.length > 0 && (
            <div className="w-full sm:max-w-2xl sm:mx-auto sm:px-4 sm:pt-5 xl:px-0">
              <PublicGallery
                images={property.images}
                title={title}
                english={english}
                className="sm:rounded-2xl"
              />
            </div>
          )}

          <main className="max-w-2xl mx-auto w-full px-4 xl:px-0 pt-5 pb-8 space-y-6">
            {/* First viewport renders visible from the server HTML — no entrance animation. */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-ink leading-tight text-balance">
                  {title}
                </h1>
                <p className="mt-2 text-sm text-body">{offerLine}</p>
                {location && (
                  <p className="flex items-center gap-1.5 mt-1 text-sm text-body">
                    <MapPin className="w-4 h-4 shrink-0" strokeWidth={2} />
                    <span>{location}</span>
                  </p>
                )}
                {property.gatedCommunity && (
                  <p className="inline-flex items-center gap-1.5 mt-3 bg-canvas-soft text-ink text-xs font-medium px-3 py-1.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                    {english ? "Gated community" : "Unidad cerrada"}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                {priceReduced && (
                  <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-ink text-white">
                    {english ? "Price reduced" : "Precio reducido"}
                  </span>
                )}
                <p className="font-bold text-ink">
                  <span className="text-4xl sm:text-5xl">{price}</span>
                  {suffix && <span className="text-lg font-medium text-body">{suffix}</span>}
                </p>
                {priceReduced && previousPrice && (
                  <p className="text-base text-body line-through">{previousPrice}</p>
                )}
              </div>

              {showContactCard && (
                <a
                  href="#agente"
                  className="xl:hidden flex items-center gap-3 rounded-2xl bg-canvas-softer px-4 py-3 hover:bg-canvas-soft transition-colors"
                >
                  <AgentAvatar user={property.user} size={36} />
                  <span className="min-w-0 text-sm text-body">
                    {english ? "Listed by " : "Publicada por "}
                    <span className="font-medium text-ink">{property.user.name}</span>
                  </span>
                </a>
              )}
            </div>

            {stats.length > 0 && (
              <div className="flex divide-x divide-hairline border-y border-hairline -mx-4 sm:mx-0 xl:mx-0 sm:rounded-2xl sm:border">
                {stats.map(({ icon: Icon, value, unit, label }) => (
                  <div key={label} className="flex-1 flex flex-col items-center py-4 px-0.5 gap-1 min-w-0">
                    <Icon className="w-4 h-4 text-body" strokeWidth={1.75} />
                    <p className="text-lg font-bold text-ink leading-none whitespace-nowrap">
                      {value.toLocaleString("es-CO")}
                      {unit && <span className="text-sm font-medium"> {unit}</span>}
                    </p>
                    <p className="text-xs text-body text-center leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {description && (
              <Reveal>
                <section>
                  <h2 className="text-xl font-bold text-ink mb-3">
                    {english ? "Description" : "Descripción"}
                  </h2>
                  <p className="text-base text-body leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </section>
              </Reveal>
            )}

            {videoId && (
              <Reveal>
                <PropertyVideo videoId={videoId} title={title} />
              </Reveal>
            )}

            {property.latitude != null && property.longitude != null && (
              <Reveal>
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  label={location || undefined}
                  directionsLabel={english ? "Get directions" : "Cómo llegar"}
                />
              </Reveal>
            )}

            {showContactCard ? (
              <div id="agente" className="xl:hidden scroll-mt-6">
                <AgentCard propertyId={property.id} user={property.user} whatsappMessage={whatsappMessage} english={english} />
              </div>
            ) : (
              <p className="flex items-start gap-3 rounded-2xl bg-canvas-softer px-5 py-4 text-sm text-body">
                <MessageCircle className="w-5 h-5 shrink-0 text-ink" strokeWidth={2} />
                {english
                  ? "Interested? Reply to the message where you got this link and the agent will help you."
                  : "¿Te interesa? Responde al mensaje en el que recibiste este link y el agente te atiende."}
              </p>
            )}
          </main>
        </div>

        {showContactCard && (
          <aside className="hidden xl:block pt-5">
            <div className="sticky top-5">
              <AgentCard propertyId={property.id} user={property.user} whatsappMessage={whatsappMessage} english={english} />
            </div>
          </aside>
        )}
      </div>

      {showContactCard && (
        <ContactBar
          propertyId={property.id}
          name={property.user.name}
          image={property.user.image}
          initials={initialsOf(property.user.name)}
          phone={property.user.phone}
          phoneIsWhatsapp={property.user.phoneIsWhatsapp}
          email={property.user.email}
          whatsappMessage={whatsappMessage}
          english={english}
        />
      )}

      <TrackVisit propertyId={property.id} />
      <PageFooter english={english} />
    </div>
  )
}
