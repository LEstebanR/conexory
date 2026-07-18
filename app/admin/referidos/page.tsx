import type { Metadata } from "next"
import { Users } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { hasProAccess } from "@/lib/plans"
import AdminNav from "../admin-nav"

export const metadata: Metadata = {
  title: "Referidos — Admin — Conexory",
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const sp = await searchParams
  const q = sp.q?.trim() ?? ""

  const referrals = await prisma.user.findMany({
    where: {
      referredById: { not: null },
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { referredBy: { name: { contains: q, mode: "insensitive" as const } } },
              { referredBy: { email: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      isPremium: true,
      role: true,
      createdAt: true,
      referredBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl w-full mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium text-mute mb-1">Admin</p>
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tighter">Referidos</h1>
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
              <th className="px-5 py-3">Referido</th>
              <th className="px-5 py-3">Referido por</th>
              <th className="px-5 py-3">Plan</th>
              <th className="px-5 py-3">Fecha de registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {referrals.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-14">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <span className="inline-flex w-12 h-12 rounded-2xl bg-canvas-soft items-center justify-center">
                      <Users className="w-5 h-5 text-mute" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {q ? "Sin resultados" : "Todavía no hay referidos"}
                      </p>
                      <p className="text-xs text-mute mt-0.5">
                        {q
                          ? "Prueba con otro nombre o email."
                          : "Cuando un usuario se registre con un link de referido, aparecerá aquí."}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              referrals.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-ink">{r.name}</p>
                    <p className="text-xs text-mute">{r.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-ink">{r.referredBy?.name}</p>
                    <p className="text-xs text-mute">{r.referredBy?.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        hasProAccess(r)
                          ? "text-xs font-black uppercase tracking-wider bg-ink text-white px-2 py-0.5 rounded-full"
                          : "text-xs font-bold uppercase tracking-wider bg-canvas-soft text-mute px-2 py-0.5 rounded-full"
                      }
                    >
                      {hasProAccess(r) ? "Pro" : "Free"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-body whitespace-nowrap">{formatDate(r.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
