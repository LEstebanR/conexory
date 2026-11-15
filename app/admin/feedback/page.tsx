import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, MessageSquareHeart } from "lucide-react"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/require-admin"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import AdminNav from "../admin-nav"
import ResolveToggle from "./resolve-toggle"
import { formatColombiaDate } from "@/lib/dates"

export const metadata: Metadata = {
  title: "Feedback — Admin",
}

const PAGE_SIZE = 20

const StatusSchema = z.enum(["pendientes", "resueltos", "todos"]).catch("pendientes")
type Status = z.infer<typeof StatusSchema>

const STATUS_WHERE = {
  pendientes: { resolvedAt: null },
  resueltos: { resolvedAt: { not: null } },
  todos: {},
} satisfies Record<Status, object>

const STATUS_LABELS: Record<Status, string> = {
  pendientes: "Pendientes",
  resueltos: "Resueltos",
  todos: "Todos",
}

const EMPTY_STATE: Record<Status, { title: string; body: string }> = {
  pendientes: {
    title: "No hay feedback pendiente",
    body: "No tienes feedback por revisar.",
  },
  resueltos: {
    title: "Todavía no hay feedback resuelto",
    body: "Cuando marques un feedback como resuelto, aparecerá aquí.",
  },
  todos: {
    title: "Todavía no hay feedback",
    body: "Cuando un usuario envíe feedback desde el sidebar, aparecerá aquí.",
  },
}

function formatDate(date: Date): string {
  return formatColombiaDate(date, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function feedbackHref(status: Status, page = 1): string {
  const params = new URLSearchParams()
  if (status !== "pendientes") params.set("status", status)
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `/admin/feedback?${qs}` : "/admin/feedback"
}

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  await requireAdmin()
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const status = StatusSchema.parse(sp.status)
  const where = STATUS_WHERE[status]

  const [feedback, total, pendingCount] = await Promise.all([
    prisma.feedback.findMany({
      where,
      select: {
        id: true,
        name: true,
        message: true,
        createdAt: true,
        resolvedAt: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.feedback.count({ where }),
    prisma.feedback.count({ where: STATUS_WHERE.pendientes }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages) redirect(feedbackHref(status, totalPages))
  const empty = EMPTY_STATE[status]

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl w-full mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium text-body mb-1">Admin</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink">Feedback</h1>
        <p className="text-sm text-body mt-2">
          Feedback pendiente: {pendingCount}
        </p>
      </div>

      <AdminNav />

      <nav aria-label="Filtrar feedback" className="flex flex-wrap gap-2 mb-6">
        {StatusSchema.removeCatch().options.map((s) => (
          <Link
            key={s}
            href={feedbackHref(s)}
            aria-current={s === status ? "page" : undefined}
            className={cn(
              buttonVariants({ size: "chip" }),
              "font-medium",
              s === status
                ? "bg-ink text-white hover:bg-elevated"
                : "bg-canvas-soft text-body hover:text-ink hover:bg-surface-pressed"
            )}
          >
            {STATUS_LABELS[s]}
            {s === "pendientes" && pendingCount > 0 && (
              <span className="tabular-nums opacity-70">{pendingCount}</span>
            )}
          </Link>
        ))}
      </nav>

      {feedback.length === 0 ? (
        <div className="bg-white rounded-2xl border border-hairline flex flex-col items-center gap-3 py-14 px-5 text-center">
          <span className="inline-flex w-12 h-12 rounded-2xl bg-canvas-soft items-center justify-center">
            <MessageSquareHeart className="w-5 h-5 text-mute" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{empty.title}</p>
            <p className="text-xs text-body mt-0.5">{empty.body}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((f) => {
            const resolved = f.resolvedAt !== null
            return (
              <div
                key={f.id}
                className={cn(
                  "rounded-2xl border border-hairline p-5",
                  resolved ? "bg-canvas-softer" : "bg-white"
                )}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-semibold truncate",
                        resolved ? "text-body" : "text-ink"
                      )}
                    >
                      {f.name || f.user.name}
                    </p>
                    <p className="text-xs text-body truncate">{f.user.email}</p>
                  </div>
                  <span className="text-xs text-body flex-shrink-0 whitespace-nowrap">
                    {formatDate(f.createdAt)}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm leading-relaxed whitespace-pre-wrap break-words",
                    resolved ? "text-body" : "text-body"
                  )}
                >
                  {f.message}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {f.resolvedAt && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-body">
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                      Resuelto el {formatDate(f.resolvedAt)}
                    </span>
                  )}
                  <ResolveToggle feedbackId={f.id} resolved={resolved} className="ml-auto" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link
              href={feedbackHref(status, page - 1)}
              className="text-sm font-medium text-body hover:text-ink px-3 py-1.5 rounded-full border border-hairline-strong"
            >
              Anterior
            </Link>
          )}
          <span className="text-sm text-body px-2">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={feedbackHref(status, page + 1)}
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
