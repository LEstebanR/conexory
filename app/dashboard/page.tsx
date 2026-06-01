import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Building2, LinkIcon, MapPin, BedDouble, Bath, Square, Share2, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

function Greeting({ name }: { name: string }) {
  const hour = new Date().getHours()
  const saludo = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches"
  return <span>{saludo}, {name.split(" ")[0]} 👋</span>
}

type Property = {
  id: string
  slug: string
  title: string
  type: string
  published: boolean
  shares: number
  price: { toNumber(): number }
  city: string
  neighborhood: string | null
  area: number | null
  bedrooms: number | null
  bathrooms: number | null
}

function PropertyCard({ property }: { property: Property }) {
  const typeLabel = TYPE_LABELS[property.type] ?? property.type
  const price = formatCOP(property.price.toNumber())
  const location = [property.neighborhood, property.city].filter(Boolean).join(", ")
  const inactive = !property.published

  return (
    <div className={cn(
      "rounded-2xl border p-5 flex flex-col gap-4 transition-colors",
      inactive
        ? "bg-slate-50 border-slate-200"
        : "bg-white border-slate-100 hover:border-slate-200"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <span className={cn(
              "inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-full",
              inactive
                ? "bg-slate-100 text-slate-400"
                : "bg-brand-50 text-brand-700"
            )}>
              {typeLabel} · En venta
            </span>
            {inactive && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-full border border-amber-200">
                <EyeOff className="w-2.5 h-2.5" />
                Inactiva
              </span>
            )}
          </div>
          <h3 className={cn(
            "font-black tracking-tight leading-tight truncate",
            inactive ? "text-slate-500" : "text-slate-950"
          )}>
            {property.title}
          </h3>
          {location && (
            <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
        <p className={cn(
          "text-lg font-black tracking-tighter flex-shrink-0",
          inactive ? "text-slate-400" : "text-slate-950"
        )}>
          {price}
        </p>
      </div>

      {(property.area != null || property.bedrooms != null || property.bathrooms != null) && (
        <div className="flex items-center gap-4">
          {property.area != null && (
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <Square className="w-3.5 h-3.5" strokeWidth={1.75} />
              {property.area} m²
            </div>
          )}
          {property.bedrooms != null && (
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <BedDouble className="w-3.5 h-3.5" strokeWidth={1.75} />
              {property.bedrooms} hab.
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
              <Bath className="w-3.5 h-3.5" strokeWidth={1.75} />
              {property.bathrooms} baños
            </div>
          )}
        </div>
      )}

      {property.shares > 0 && (
        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium -mt-1">
          <Share2 className="w-3 h-3" />
          {property.shares} {property.shares === 1 ? "vez compartida" : "veces compartida"}
        </div>
      )}

      <div className="flex gap-2 pt-1 border-t border-slate-100">
        <Link
          href={`/dashboard/properties/${property.id}`}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-colors",
            inactive
              ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
              : "bg-brand-50 text-brand-700 hover:bg-brand-100"
          )}
        >
          <Share2 className="w-3.5 h-3.5" />
          Ver link
        </Link>
        <Link
          href={`/p/${property.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-slate-50 text-slate-400 text-xs font-bold hover:bg-slate-100 transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Vista pública
        </Link>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

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
    },
    orderBy: [{ published: "desc" }, { createdAt: "desc" }],
  })

  type P = (typeof properties)[number]
  const activeCount = properties.filter((p: P) => p.published).length
  const count = properties.length
  const totalShares = properties.reduce((sum: number, p: P) => sum + p.shares, 0)

  const statCards = [
    { label: "Propiedades activas", value: activeCount, icon: Building2, color: "text-brand-500", bg: "bg-brand-50" },
    { label: "Links generados", value: count, icon: LinkIcon, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Veces compartida", value: totalShares, icon: Share2, color: "text-violet-500", bg: "bg-violet-50" },
  ]

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-1">
            <Greeting name={session.user.name} />
          </h1>
          <p className="text-slate-500 text-sm">
            Administra y comparte tus propiedades desde un solo lugar.
          </p>
        </div>
        <Button size="sm" className="hidden sm:flex font-bold shadow-sm shadow-brand-400/20 flex-shrink-0" asChild>
          <Link href="/dashboard/properties/new">
            <Plus className="w-4 h-4" />
            Nueva propiedad
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-950 tracking-tighter leading-none">{stat.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Properties */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-slate-950 tracking-tight">Mis propiedades</h2>
        <Button size="sm" variant="ghost" className="text-brand-500 font-bold hover:text-brand-600 hover:bg-brand-50 sm:hidden" asChild>
          <Link href="/dashboard/properties/new">
            <Plus className="w-4 h-4" />
            Nueva
          </Link>
        </Button>
      </div>

      {count === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-brand-50 border-2 border-brand-100 flex items-center justify-center">
              <Building2 className="w-9 h-9 text-brand-300" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-400 rounded-full flex items-center justify-center shadow-md">
              <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-950 tracking-tight mb-2">
            Todavía no tienes propiedades
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-8">
            Crea tu primera propiedad, obtén tu link único y compártelo por WhatsApp en menos de 60 segundos.
          </p>
          <Button size="default" className="font-bold shadow-sm shadow-brand-400/20" asChild>
            <Link href="/dashboard/properties/new">
              <Plus className="w-4 h-4" />
              Crear primera propiedad
            </Link>
          </Button>
          <div className="flex items-center gap-6 mt-8">
            {[
              { icon: "💰", label: "Escribe el precio" },
              { icon: "📝", label: "Completa los datos" },
              { icon: "🔗", label: "Obtén tu link" },
            ].map((step) => (
              <div key={step.label} className="flex flex-col items-center gap-1.5">
                <span className="text-2xl">{step.icon}</span>
                <span className="text-xs text-slate-400 font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p: P) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  )
}
