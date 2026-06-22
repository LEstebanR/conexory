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
} from "lucide-react"

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
import { prisma } from "@/lib/prisma"
import { getAppUrl } from "@/lib/urls"
import AgentProperties, { type AgentProperty } from "./agent-properties"

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  office: "Oficina",
  commercial: "Local comercial",
  lot: "Lote",
  warehouse: "Bodega",
}
void TYPE_LABELS

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
      instagram: true,
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
          parking: true,
          shares: true,
          latitude: true,
          longitude: true,
          createdAt: true,
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

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "")
  if (d.length === 10 && d.startsWith("3")) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6)}`
  if (d.length === 7) return `${d.slice(0, 3)} ${d.slice(3)}`
  return raw
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

  const properties: AgentProperty[] = agent.properties.map((p) => ({
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.getTime(),
  }))

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-10 pb-10">

        {/* Avatar + info */}
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

          {/* Instagram link */}
          {agent.instagram && (
            <a
              href={`https://instagram.com/${agent.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 mt-2 text-sm text-mute hover:text-ink transition-colors"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              @{agent.instagram}
            </a>
          )}

          {agent.bio && (
            <p className="text-sm text-body leading-relaxed mt-4 max-w-xs">{agent.bio}</p>
          )}
        </div>

        {/* Stats band */}
        <div className="rounded-2xl bg-canvas-soft grid grid-cols-3 divide-x divide-hairline mb-5">
          {[
            { label: "Propiedades", value: agent.properties.length },
            { label: "Links enviados", value: totalShares },
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
                    {formatPhone(agent.phone)}
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

        {/* Properties + search + filters + map */}
        <AgentProperties properties={properties} />
      </main>

      <PageFooter />
    </div>
  )
}
