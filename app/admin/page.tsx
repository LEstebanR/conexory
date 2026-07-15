import type { Metadata } from "next"
import { Users, Building2, Zap, TrendingUp, Layers, ListChecks } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { daysAgo } from "@/lib/dates"
import { FREE_PROPERTY_LIMIT } from "@/lib/plans"
import { PROPERTY_TYPE_LABELS } from "@/lib/property-types"
import { cn } from "@/lib/utils"
import AdminNav from "./admin-nav"

export const metadata: Metadata = {
  title: "Admin — Conexory",
}

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: number
}) {
  return (
    <div className="min-w-0 px-4 py-6 sm:px-7 sm:py-7">
      <span className="inline-flex w-8 h-8 rounded-lg bg-white/10 items-center justify-center mb-4">
        <Icon className="w-4 h-4 text-white" strokeWidth={2} />
      </span>
      <p className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-none tabular-nums">
        {value}
      </p>
      <p className="text-xs sm:text-sm text-mute font-medium mt-2">{label}</p>
    </div>
  )
}

function MiniStat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-hairline p-6 h-full flex flex-col items-center justify-center text-center">
      <p className="text-5xl sm:text-6xl font-black text-ink tracking-tighter tabular-nums leading-none">
        {value}
      </p>
      <p className="text-xs font-semibold text-mute uppercase tracking-wider mt-3">{label}</p>
      {hint && <p className="text-xs text-body mt-1">{hint}</p>}
    </div>
  )
}

function DistributionRow({
  label,
  count,
  total,
  emphasize = false,
}: {
  label: string
  count: number
  total: number
  emphasize?: boolean
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-sm font-medium text-body w-32 sm:w-44 truncate flex-shrink-0">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-canvas-soft overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            emphasize ? "bg-ink" : "bg-hairline-strong"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-bold text-ink tabular-nums w-[4.5rem] text-right flex-shrink-0">
        {count} <span className="text-mute font-medium">· {pct}%</span>
      </span>
    </div>
  )
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-hairline p-5 sm:p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex w-7 h-7 rounded-lg bg-canvas-soft items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 text-ink" strokeWidth={2} />
        </span>
        <h3 className="text-sm font-bold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default async function AdminPage() {
  const week = daysAgo(7)
  const month = daysAgo(30)

  const [
    totalUsers,
    newUsers7d,
    newUsers30d,
    freeUsers,
    proUsers,
    usersWithPublishedProperty,
    totalProperties,
    publishedProperties,
    propertiesByType,
    topSharedProperties,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: week } } }),
    prisma.user.count({ where: { createdAt: { gte: month } } }),
    prisma.user.count({ where: { isPremium: false } }),
    prisma.user.count({ where: { isPremium: true } }),
    prisma.user.count({ where: { properties: { some: { published: true } } } }),
    prisma.property.count(),
    prisma.property.count({ where: { published: true } }),
    prisma.property.groupBy({ by: ["type"], _count: { id: true } }),
    prisma.property.findMany({
      orderBy: { shares: "desc" },
      take: 10,
      select: { id: true, title: true, shares: true, city: true },
    }),
  ])

  // Filtered relation counts aren't directly comparable in a single query, so
  // fetch active-property counts for free users and filter in memory.
  const freeUsersWithCounts = await prisma.user.findMany({
    where: { isPremium: false },
    select: { id: true, _count: { select: { properties: { where: { published: true } } } } },
  })
  const freeUsersAtLimit = freeUsersWithCounts.filter(
    (u) => u._count.properties === FREE_PROPERTY_LIMIT
  ).length

  const unpublishedProperties = totalProperties - publishedProperties
  const sortedPropertyTypes = [...propertiesByType].sort((a, b) => b._count.id - a._count.id)

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl w-full mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium text-mute mb-1">Admin</p>
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tighter">Métricas</h1>
      </div>

      <AdminNav />

      {/* Headline numbers */}
      <div className="rounded-2xl bg-elevated grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/10 mb-8">
        <HeroStat icon={Users} label="Usuarios totales" value={totalUsers} />
        <HeroStat icon={Building2} label="Propiedades totales" value={totalProperties} />
        <HeroStat icon={Zap} label="Usuarios Pro" value={proUsers} />
        <HeroStat icon={TrendingUp} label="Nuevos (30 días)" value={newUsers30d} />
      </div>

      {/* Usuarios */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-ink uppercase tracking-wider mb-3">Usuarios</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card title="Free vs Pro" icon={Users}>
            <DistributionRow label="Free" count={freeUsers} total={totalUsers} />
            <DistributionRow label="Pro" count={proUsers} total={totalUsers} emphasize />
          </Card>
          <div className="grid grid-cols-2 gap-4 h-full">
            <MiniStat label="Nuevos (7 días)" value={newUsers7d} />
            <MiniStat label="Con propiedad publicada" value={usersWithPublishedProperty} />
          </div>
        </div>
      </div>

      {/* Propiedades */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-ink uppercase tracking-wider mb-3">Propiedades</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Card title="Publicadas vs despublicadas" icon={ListChecks}>
            <DistributionRow label="Publicadas" count={publishedProperties} total={totalProperties} emphasize />
            <DistributionRow label="Despublicadas" count={unpublishedProperties} total={totalProperties} />
          </Card>
          <Card title="Distribución por tipo" icon={Layers}>
            {sortedPropertyTypes.length === 0 ? (
              <p className="text-sm text-mute">Sin datos todavía.</p>
            ) : (
              sortedPropertyTypes.map((row) => (
                <DistributionRow
                  key={row.type}
                  label={PROPERTY_TYPE_LABELS[row.type] ?? row.type}
                  count={row._count.id}
                  total={totalProperties}
                />
              ))
            )}
          </Card>
        </div>
      </div>

      {/* Planes */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-ink uppercase tracking-wider mb-3">Planes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <MiniStat label="Free" value={freeUsers} />
          <MiniStat
            label="Free en el límite"
            value={freeUsersAtLimit}
            hint={`${FREE_PROPERTY_LIMIT}/${FREE_PROPERTY_LIMIT} propiedades activas`}
          />
          <MiniStat label="Pro activos" value={proUsers} />
        </div>
      </div>

      {/* Top propiedades */}
      <div className="mb-8">
        <h2 className="text-sm font-bold text-ink uppercase tracking-wider mb-3">
          Top 10 propiedades por veces compartidas
        </h2>
        <div className="bg-white rounded-2xl border border-hairline divide-y divide-hairline">
          {topSharedProperties.length === 0 ? (
            <p className="text-sm text-mute p-5">Sin datos todavía.</p>
          ) : (
            topSharedProperties.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                <span
                  className={
                    i === 0
                      ? "flex-shrink-0 w-6 h-6 rounded-full bg-ink text-white text-xs font-bold flex items-center justify-center"
                      : "flex-shrink-0 w-6 h-6 rounded-full bg-canvas-soft text-ink text-xs font-bold flex items-center justify-center"
                  }
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{p.title}</p>
                  <p className="text-xs text-mute truncate">{p.city}</p>
                </div>
                <span className="text-sm font-bold text-ink tabular-nums flex-shrink-0">
                  {p.shares}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
