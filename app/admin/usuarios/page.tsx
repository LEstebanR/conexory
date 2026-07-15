import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { prisma } from "@/lib/prisma"
import AdminNav from "../admin-nav"
import PremiumToggle from "./premium-toggle"

export const metadata: Metadata = {
  title: "Usuarios — Admin — Conexory",
}

const PAGE_SIZE = 20

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const q = sp.q?.trim() ?? ""

  const where = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" as const } },
          { name: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : undefined

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        isPremium: true,
        agentSlug: true,
        profilePublished: true,
        createdAt: true,
        _count: { select: { properties: { where: { published: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    params.set("page", String(p))
    return `/admin/usuarios?${params.toString()}`
  }

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl w-full mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium text-mute mb-1">Admin</p>
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tighter">Usuarios</h1>
      </div>

      <AdminNav />

      <form method="get" className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o email…"
          className="w-full max-w-sm h-10 px-4 rounded-full border border-hairline-strong text-sm focus:outline-none focus:ring-2 focus:ring-ink"
        />
      </form>

      <div className="bg-white rounded-2xl border border-hairline overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-xs font-bold text-mute uppercase tracking-wider">
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Propiedades activas</th>
              <th className="px-5 py-3">Registro</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-mute">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-semibold text-ink whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {u.name}
                      {u.profilePublished && u.agentSlug && (
                        <Link
                          href={`/agente/${u.agentSlug}`}
                          target="_blank"
                          className="text-mute hover:text-ink transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-body">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        u.isPremium
                          ? "text-xs font-black uppercase tracking-wider bg-ink text-white px-2 py-0.5 rounded-full"
                          : "text-xs font-bold uppercase tracking-wider bg-canvas-soft text-mute px-2 py-0.5 rounded-full"
                      }
                    >
                      {u.isPremium ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td className="px-5 py-3 tabular-nums text-body">{u._count.properties}</td>
                  <td className="px-5 py-3 text-body whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3">
                    <PremiumToggle userId={u.id} userName={u.name} initialIsPremium={u.isPremium} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="text-sm font-medium text-body hover:text-ink px-3 py-1.5 rounded-full border border-hairline-strong"
            >
              Anterior
            </Link>
          )}
          <span className="text-sm text-mute px-2">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={pageHref(page + 1)}
              className="text-sm font-medium text-body hover:text-ink px-3 py-1.5 rounded-full border border-hairline-strong"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
