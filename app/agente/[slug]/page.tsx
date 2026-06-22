import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  ArrowUpRight,
  Building2,
} from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getAppUrl } from "@/lib/urls"

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  office: "Oficina",
  commercial: "Local comercial",
  lot: "Lote",
  warehouse: "Bodega",
}

function formatCOP(amount: number): string {
  if (amount >= 1_000_000_000) {
    const b = amount / 1_000_000_000
    return `$${Number.isInteger(b) ? b.toLocaleString("es-CO") : b.toLocaleString("es-CO", { maximumFractionDigits: 1 })} B`
  }
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000
    return `$${Number.isInteger(m) ? m.toLocaleString("es-CO") : m.toLocaleString("es-CO", { maximumFractionDigits: 0 })} M`
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

async function getAgent(slug: string) {
  return prisma.user.findUnique({
    where: { agentSlug: slug },
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      location: true,
      bio: true,
      phone: true,
      phoneIsWhatsapp: true,
      profilePublished: true,
      properties: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          price: true,
          city: true,
          state: true,
          neighborhood: true,
          images: true,
          area: true,
          bedrooms: true,
          bathrooms: true,
          shares: true,
        },
      },
    },
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const agent = await getAgent(slug)
  if (!agent || !agent.profilePublished) return {}

  const title = `${agent.name} · Asesor inmobiliario`
  const description =
    agent.bio ||
    `Conoce las propiedades de ${agent.name} en Conexory. ${agent.properties.length} propiedad${agent.properties.length !== 1 ? "es" : ""} activa${agent.properties.length !== 1 ? "s" : ""}.`
  const appUrl = getAppUrl()

  return {
    title,
    description,
    openGraph: {
      type: "profile",
      url: `${appUrl}/agente/${slug}`,
      title,
      description,
      siteName: "Conexory",
    },
    twitter: { card: "summary_large_image", title, description },
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
          <Image src="/mark-white.png" alt="Conexory" width={20} height={20} className="w-5 h-5" />
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

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const agent = await getAgent(slug)

  if (!agent || !agent.profilePublished) notFound()

  const initials = agent.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const totalShares = agent.properties.reduce((s, p) => s + p.shares, 0)
  const uniqueCities = new Set(agent.properties.map((p) => p.city)).size

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-10 pb-10">

        {/* Avatar + info centrada */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            {agent.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agent.image}
                alt={agent.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-canvas-soft"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-ink flex items-center justify-center text-white text-2xl font-black select-none ring-4 ring-canvas-soft">
                {initials}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-black text-ink tracking-tight leading-tight">
            {agent.name}
          </h1>
          <p className="text-sm font-semibold text-body mt-0.5">Asesor inmobiliario</p>

          {agent.location && (
            <div className="flex items-center justify-center gap-1 mt-2">
              <MapPin className="w-3.5 h-3.5 text-mute flex-shrink-0" strokeWidth={2} />
              <span className="text-sm text-mute">{agent.location}</span>
            </div>
          )}

          {agent.bio && (
            <p className="text-sm text-body leading-relaxed mt-4 max-w-xs">{agent.bio}</p>
          )}
        </div>

        {/* Stats band */}
        <div className="rounded-2xl bg-canvas-soft grid grid-cols-3 divide-x divide-hairline mb-5">
          {[
            { label: "Propiedades", value: agent.properties.length },
            { label: "Compartidas", value: totalShares },
            { label: "Ciudades", value: uniqueCities },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-4 px-2">
              <span className="text-2xl font-black text-ink tabular-nums">{stat.value}</span>
              <span className="text-xs text-mute font-medium mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Contact buttons */}
        {(agent.phone || agent.email) && (
          <div className="space-y-2 mb-8">
            {agent.phone && agent.phoneIsWhatsapp && (
              <a
                href={`https://wa.me/${agent.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2.5 h-12 rounded-full bg-ink text-white text-sm font-bold hover:bg-elevated transition-colors"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2} />
                Escríbeme por WhatsApp
              </a>
            )}
            {(agent.phone || agent.email) && (
              <div className="grid grid-cols-2 gap-2">
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className="flex items-center justify-center gap-2 h-12 rounded-full border border-hairline-strong text-ink text-sm font-bold hover:bg-canvas-soft transition-colors"
                  >
                    <Phone className="w-4 h-4" strokeWidth={2} />
                    Llamar
                  </a>
                )}
                <a
                  href={`mailto:${agent.email}`}
                  className={`flex items-center justify-center gap-2 h-12 rounded-full border border-hairline-strong text-ink text-sm font-bold hover:bg-canvas-soft transition-colors${!agent.phone ? " col-span-2" : ""}`}
                >
                  <Mail className="w-4 h-4" strokeWidth={2} />
                  Correo
                </a>
              </div>
            )}
          </div>
        )}

        {/* Properties */}
        {agent.properties.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-black text-ink">Propiedades disponibles</h2>
              <span className="text-sm font-bold text-mute">{agent.properties.length}</span>
            </div>

            <div className="space-y-3">
              {agent.properties.map((property) => {
                const cover = property.images[0]
                const location = [property.neighborhood, property.city]
                  .filter(Boolean)
                  .join(", ")
                const typeLabel = TYPE_LABELS[property.type] ?? property.type
                const hasStats = property.area != null || property.bedrooms != null || property.bathrooms != null

                return (
                  <Link
                    key={property.id}
                    href={`/p/${property.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-3 bg-white rounded-2xl border border-hairline hover:border-hairline-strong overflow-hidden transition-all hover:shadow-sm p-3"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-canvas-soft flex-shrink-0 relative">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="w-7 h-7 text-mute" strokeWidth={1.5} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <span className="inline-block text-[10px] font-bold bg-canvas-soft text-body px-2 py-0.5 rounded-full mb-1.5">
                          {typeLabel}
                        </span>
                        <p className="text-sm font-black text-ink leading-snug line-clamp-2 group-hover:underline decoration-1 underline-offset-2">
                          {property.title}
                        </p>
                        {location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-mute flex-shrink-0" strokeWidth={2} />
                            <span className="text-xs text-mute truncate">{location}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-base font-black text-ink tracking-tight mt-1.5">
                          {formatCOP(Number(property.price))}
                        </p>
                        {hasStats && (
                          <p className="text-xs text-mute mt-0.5">
                            {[
                              property.bedrooms != null && `${property.bedrooms} hab`,
                              property.bathrooms != null && `${property.bathrooms} baño${property.bathrooms !== 1 ? "s" : ""}`,
                              property.area != null && `${property.area} m²`,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <PageFooter />
    </div>
  )
}
