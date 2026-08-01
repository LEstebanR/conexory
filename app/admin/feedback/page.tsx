import type { Metadata } from "next"
import Link from "next/link"
import { MessageSquareHeart } from "lucide-react"
import { prisma } from "@/lib/prisma"
import AdminNav from "../admin-nav"

export const metadata: Metadata = {
  title: "Feedback — Admin — Conexory",
}

const PAGE_SIZE = 20

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)

  const [feedback, total] = await Promise.all([
    prisma.feedback.findMany({
      select: {
        id: true,
        name: true,
        message: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.feedback.count(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl w-full mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium text-mute mb-1">Admin</p>
        <h1 className="text-3xl sm:text-4xl font-black text-ink tracking-tighter">Feedback</h1>
      </div>

      <AdminNav />

      {feedback.length === 0 ? (
        <div className="bg-white rounded-2xl border border-hairline flex flex-col items-center gap-3 py-14 px-5 text-center">
          <span className="inline-flex w-12 h-12 rounded-2xl bg-canvas-soft items-center justify-center">
            <MessageSquareHeart className="w-5 h-5 text-mute" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Todavía no hay feedback</p>
            <p className="text-xs text-mute mt-0.5">
              Cuando un usuario envíe feedback desde el sidebar, aparecerá aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((f) => (
            <div key={f.id} className="bg-white rounded-2xl border border-hairline p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">
                    {f.name || f.user.name}
                  </p>
                  <p className="text-xs text-mute truncate">{f.user.email}</p>
                </div>
                <span className="text-xs text-mute flex-shrink-0 whitespace-nowrap">
                  {formatDate(f.createdAt)}
                </span>
              </div>
              <p className="text-sm text-body leading-relaxed whitespace-pre-wrap">{f.message}</p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={`/admin/feedback?page=${page - 1}`}
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
              href={`/admin/feedback?page=${page + 1}`}
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
