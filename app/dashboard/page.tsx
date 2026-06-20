import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Building2, Zap, DollarSign, FileText, LinkIcon, Eye, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { propertyLimit, PRO_PROPERTY_LIMIT } from "@/lib/plans"
import PropertiesList, { type PropertyItem } from "./properties-list"
import UpgradeSuccessToast from "./upgrade-success-toast"

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  office: "Oficina",
  commercial: "Local comercial",
  lot: "Lote",
  warehouse: "Bodega",
}

function formatCompactCOP(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000
    const value = Number.isInteger(millions)
      ? millions.toLocaleString("es-CO")
      : millions.toLocaleString("es-CO", { maximumFractionDigits: 1 })
    return `$${value} M`
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount)
}

function greeting(name: string): string {
  const hour = new Date().getHours()
  const saludo = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches"
  return `${saludo}, ${name.split(" ")[0]}`
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string; id?: string }>
}) {
  const [session, sp] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    searchParams,
  ])
  if (!session) redirect("/login")

  const upgrade = sp.upgrade
  // Wompi always appends ?id=<transactionId>&env=<env> on redirect.
  // Use either signal to detect a post-payment landing.
  const isPostPayment = upgrade === "success" || Boolean(sp.id)

  const properties = await prisma.property.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      published: true,
      shares: true,
      price: true,
      city: true,
      neighborhood: true,
      area: true,
      bedrooms: true,
      bathrooms: true,
      parking: true,
      images: true,
      createdAt: true,
    },
    orderBy: [{ published: "desc" }, { createdAt: "desc" }],
  })

  type P = (typeof properties)[number]
  const activeCount = properties.filter((p: P) => p.published).length
  const count = properties.length
  const totalShares = properties.reduce((sum: number, p: P) => sum + p.shares, 0)
  // The session cookie cache (better-auth cookieCache, TTL 5 min) may hold a
  // stale isPremium=false after the webhook activates Pro. On post-payment
  // landing (Wompi always appends ?id=), bypass the cache with a direct DB
  // query for this render. The cache expires naturally within 5 minutes.
  let isPremium = session.user.isPremium
  if (isPostPayment) {
    const freshUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    })
    isPremium = freshUser?.isPremium ?? session.user.isPremium
  }
  const limit = propertyLimit(isPremium)
  const atLimit = activeCount >= limit
  const upgradeHref = isPremium ? "/contacto" : "/dashboard/upgrade"
  const upgradeLabel = isPremium ? "Plan a medida" : "Actualizar a Pro"
  const limitTitle = isPremium ? "Límite del plan Pro alcanzado" : "Límite del plan gratuito alcanzado"
  const limitMessage = isPremium
    ? `Tienes ${activeCount} propiedades activas, el máximo de tu plan Pro. Contáctanos para un plan personalizado.`
    : `Tienes ${activeCount} propiedades activas. Actualiza a Pro para publicar hasta ${PRO_PROPERTY_LIMIT} propiedades.`

  const items: PropertyItem[] = properties.map((p: P) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    type: p.type,
    typeLabel: TYPE_LABELS[p.type] ?? p.type,
    published: p.published,
    shares: p.shares,
    price: formatCompactCOP(p.price.toNumber()),
    priceValue: p.price.toNumber(),
    location: [p.neighborhood, p.city].filter(Boolean).join(", "),
    area: p.area,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    parking: p.parking,
    image: p.images[0] ?? null,
    createdAt: p.createdAt.getTime(),
  }))

  const stats = [
    { label: "Propiedades", value: count, icon: Building2 },
    { label: "Activas", value: activeCount, icon: Eye },
    { label: "Veces compartidas", value: totalShares, icon: Share2 },
  ]

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl w-full mx-auto">
      {upgrade === "success" && <UpgradeSuccessToast />}
      {/* Header */}
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-medium text-mute mb-1">{greeting(session.user.name)}</p>
          <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tighter">
            Tus propiedades
          </h1>
        </div>
        <Button size="sm" className="flex-shrink-0" asChild>
          <Link href={atLimit ? upgradeHref : "/dashboard/properties/new"}>
            {atLimit ? <Zap className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span className="hidden sm:inline">{atLimit ? upgradeLabel : "Nueva propiedad"}</span>
            <span className="sm:hidden">{atLimit ? "Pro" : "Nueva"}</span>
          </Link>
        </Button>
      </div>

      {/* Stats band */}
      <div className="rounded-2xl bg-elevated grid grid-cols-3 divide-x divide-white/10 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0 px-3 py-6 sm:px-7 sm:py-7">
            <span className="inline-flex w-8 h-8 rounded-lg bg-white/10 items-center justify-center mb-4">
              <stat.icon className="w-4 h-4 text-white" strokeWidth={2} />
            </span>
            <p className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-none tabular-nums">
              {stat.value}
            </p>
            <p className="text-xs sm:text-sm text-mute font-medium mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Plan limit banner */}
      {atLimit && (
        <div className="mb-6 flex items-center gap-4 bg-warning-50 border border-warning-200 rounded-2xl px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-warning-500" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-warning-900">{limitTitle}</p>
            <p className="text-xs text-warning-700 mt-0.5">{limitMessage}</p>
          </div>
          <Button size="sm" className="flex-shrink-0 hidden sm:flex" asChild>
            <Link href={upgradeHref}>{upgradeLabel}</Link>
          </Button>
        </div>
      )}

      {/* Properties */}
      {count === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-hairline-strong flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-canvas-soft flex items-center justify-center">
              <Building2 className="w-9 h-9 text-mute" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-ink rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="text-xl font-black text-ink tracking-tight mb-2">
            Todavía no tienes propiedades
          </h3>
          <p className="text-body text-sm leading-relaxed max-w-xs mb-8">
            Crea tu primera propiedad, obtén tu link único y compártelo por WhatsApp en menos de 60 segundos.
          </p>
          <Button size="default" asChild>
            <Link href="/dashboard/properties/new">
              <Plus className="w-4 h-4" />
              Crear primera propiedad
            </Link>
          </Button>
          <div className="flex items-center gap-6 mt-8">
            {[
              { icon: DollarSign, label: "Escribe el precio" },
              { icon: FileText, label: "Completa los datos" },
              { icon: LinkIcon, label: "Obtén tu link" },
            ].map((step) => (
              <div key={step.label} className="flex flex-col items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-canvas-soft flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-ink" strokeWidth={1.75} />
                </span>
                <span className="text-xs text-mute font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <PropertiesList items={items} />
      )}
    </div>
  )
}
