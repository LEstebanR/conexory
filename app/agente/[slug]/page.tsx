import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Phone, MessageCircle, Mail, ArrowUpRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getAppUrl } from "@/lib/urls"
import AgentProperties, { type AgentProperty } from "./agent-properties"

// ── Inline SVG brand icons ─────────────────────────────────────────────────

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

// ── Data ───────────────────────────────────────────────────────────────────

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
      facebook: true,
      tiktok: true,
      linkedin: true,
      youtube: true,
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

// ── Helpers ────────────────────────────────────────────────────────────────

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "")
  if (d.length === 10 && d.startsWith("3")) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6)}`
  if (d.length === 7) return `${d.slice(0, 3)} ${d.slice(3)}`
  return raw
}

// ── Page ───────────────────────────────────────────────────────────────────

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

  const uniqueCities = new Set(agent.properties.map((p) => p.city)).size

  const properties: AgentProperty[] = agent.properties.map((p) => ({
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.getTime(),
  }))

  const socialLinks = [
    { handle: agent.instagram, href: `https://instagram.com/${agent.instagram}`,     label: "Instagram", Icon: InstagramIcon },
    { handle: agent.tiktok,    href: `https://tiktok.com/@${agent.tiktok}`,           label: "TikTok",    Icon: TikTokIcon },
    { handle: agent.facebook,  href: `https://facebook.com/${agent.facebook}`,        label: "Facebook",  Icon: FacebookIcon },
    { handle: agent.linkedin,  href: `https://linkedin.com/in/${agent.linkedin}`,     label: "LinkedIn",  Icon: LinkedInIcon },
    { handle: agent.youtube,   href: `https://youtube.com/@${agent.youtube}`,         label: "YouTube",   Icon: YouTubeIcon },
  ].filter(({ handle }) => !!handle)

  const hasContact = !!(agent.phone || agent.email)
  const hasSocial = socialLinks.length > 0

  return (
    <div className="min-h-screen bg-canvas flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-12 pb-10 px-5">
        <div className="max-w-lg mx-auto flex flex-col items-center text-center">

          {/* Avatar */}
          <div className="mb-5">
            {agent.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agent.image}
                alt={agent.name}
                className="w-[100px] h-[100px] rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="w-[100px] h-[100px] rounded-full bg-ink flex items-center justify-center text-white text-2xl font-black select-none shadow-md">
                {initials}
              </div>
            )}
          </div>

          {/* Identity */}
          <h1 className="text-2xl font-black text-ink tracking-tight leading-tight">
            {agent.name}
          </h1>
          <p className="text-sm text-mute font-medium mt-1">Asesor inmobiliario</p>

          {agent.location && (
            <div className="flex items-center justify-center gap-1 mt-2.5">
              <MapPin className="w-3.5 h-3.5 text-mute flex-shrink-0" strokeWidth={2} />
              <span className="text-sm text-body">{agent.location}</span>
            </div>
          )}

          {/* Bio */}
          {agent.bio && (
            <p className="text-sm text-body leading-relaxed mt-4 max-w-[280px]">
              {agent.bio}
            </p>
          )}

          {/* Quick stats — only if meaningful */}
          {agent.properties.length > 0 && (
            <div className="flex items-center gap-1.5 mt-4 text-xs text-mute font-medium">
              <span className="font-black text-ink text-sm">{agent.properties.length}</span>
              {agent.properties.length === 1 ? "propiedad" : "propiedades"}
              {uniqueCities > 1 && (
                <>
                  <span className="text-hairline-strong mx-0.5">·</span>
                  <span className="font-black text-ink text-sm">{uniqueCities}</span>
                  ciudades
                </>
              )}
            </div>
          )}

          {/* Social icons */}
          {hasSocial && (
            <div className="flex items-center gap-2 mt-5 flex-wrap justify-center">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white border border-hairline-strong flex items-center justify-center text-body hover:text-ink hover:border-ink transition-colors shadow-sm"
                >
                  <Icon className="w-[18px] h-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      {hasContact && (
        <section className="max-w-lg mx-auto w-full px-5 py-7 space-y-2.5">
          {agent.phone && agent.phoneIsWhatsapp && (
            <a
              href={`https://wa.me/${agent.phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2.5 h-12 rounded-full bg-ink text-white text-sm font-bold hover:bg-elevated transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={2} />
              Escríbeme por WhatsApp
            </a>
          )}

          {/* Secondary: phone + email side by side when both present */}
          <div className={`grid gap-2.5 ${agent.phone && agent.email ? "grid-cols-2" : "grid-cols-1"}`}>
            {agent.phone && (
              <a
                href={`tel:${agent.phone}`}
                className="flex items-center justify-center gap-2 h-12 rounded-full border border-hairline-strong bg-white text-ink text-sm font-bold hover:bg-canvas-soft transition-colors"
              >
                <Phone className="w-4 h-4" strokeWidth={2} />
                {formatPhone(agent.phone)}
              </a>
            )}
            {agent.email && (
              <a
                href={`mailto:${agent.email}`}
                className="flex items-center justify-center gap-2 h-12 rounded-full border border-hairline-strong bg-white text-ink text-sm font-bold hover:bg-canvas-soft transition-colors"
              >
                <Mail className="w-4 h-4" strokeWidth={2} />
                Correo
              </a>
            )}
          </div>
        </section>
      )}

      {/* ── Properties ───────────────────────────────────────────────────── */}
      {properties.length > 0 && (
        <section className="flex-1">
          <div className="max-w-lg mx-auto w-full px-5 py-7">
            <AgentProperties properties={properties} />
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-hairline">
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
    </div>
  )
}
