import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { hasProAccess } from "@/lib/plans"
import AdminNav from "../admin-nav"

export const metadata: Metadata = {
  title: "Referidos — Admin — Conexory",
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
}

export default async function AdminReferralsPage() {
  const referrals = await prisma.user.findMany({
    where: { referredById: { not: null } },
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
                <td colSpan={4} className="px-5 py-8 text-center text-mute">
                  Todavía no hay referidos.
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
