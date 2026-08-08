import { redirect } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { Check, CreditCard, Zap, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { SubscribeCardForm } from "./subscribe-card-form"
import { ChangeCardForm } from "./change-card-form"
import { UpgradeErrorToast } from "./upgrade-error-toast"
import { hasProAccess, PRO_VALUE_POINTS } from "@/lib/plans"
import type { Metadata } from "next"

const CARD_BRAND_NAMES: Record<string, string> = {
  master: "Mastercard",
  visa: "Visa",
  amex: "American Express",
  diners: "Diners Club",
}

function formatCardBrand(brand: string): string {
  return CARD_BRAND_NAMES[brand] ?? brand.charAt(0).toUpperCase() + brand.slice(1)
}

export const metadata: Metadata = {
  title: "Plan Pro — Conexory",
}

const PRO_FEATURES = [
  "Hasta 50 propiedades activas",
  "Hasta 20 fotos por propiedad",
  "Link único por propiedad",
  "Vista pública para tus clientes",
]

// Provisional support inbox for plan-related questions — not yet the
// verified conexory.com domain, so it's a plain mailto rather than
// something sent via Resend (see lib/email.ts TEAM_INBOX).
const PLAN_SUPPORT_MAILTO = `mailto:conexory@gmail.com?cc=leramirezca@gmail.com&subject=${encodeURIComponent("Ayuda con mi plan Conexory")}`

function formatDate(date: Date) {
  // Render in Colombia time (UTC-5) so the date the user sees matches their day.
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  })
}

export default async function UpgradePage() {
  const session = await getSession()
  if (!session) redirect("/login")

  if (hasProAccess(session.user)) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { currentPeriodEnd: true, createdAt: true, status: true, cardBrand: true, cardLastFour: true },
    })
    const isCanceling = subscription?.status === "canceling"
    const isPastDue = subscription?.status === "past_due"

    return (
      <div className="flex-1 flex items-start justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${isPastDue ? "bg-warning-100" : "bg-ink"}`}
            >
              {isPastDue ? (
                <AlertTriangle className="w-5 h-5 text-warning-600" strokeWidth={2} />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2} />
              )}
            </div>
            <h1 className="text-2xl font-black text-ink tracking-tighter">
              {isPastDue ? "No pudimos procesar tu pago" : isCanceling ? "Suscripción cancelada" : "Plan Pro activo"}
            </h1>
            <p className="text-sm text-body mt-1">
              {isPastDue
                ? "Tu plan Pro pasará a Free automáticamente"
                : isCanceling
                ? "Conservas los beneficios Pro hasta el fin del período"
                : "Estás disfrutando de todos los beneficios Pro"}
            </p>
          </div>

          <div className="rounded-3xl bg-ink text-white p-7">
            <ul className="space-y-3 mb-7">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15 flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mb-6 pb-6 border-b border-white/10">
              {subscription?.cardBrand || subscription?.cardLastFour ? (
                <div className="flex items-center gap-3 mb-1">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-white/70" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {subscription.cardBrand ? formatCardBrand(subscription.cardBrand) : "Tarjeta"}
                      {subscription.cardLastFour ? ` ···· ${subscription.cardLastFour}` : ""}
                    </p>
                    <p className="text-xs text-white/40">
                      {subscription.cardLastFour
                        ? "Se cobra automáticamente cada mes"
                        : "Confirmando los últimos dígitos con Mercado Pago…"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/40 mb-1">
                  Confirmando los datos de tu tarjeta con Mercado Pago…
                </p>
              )}
              {subscription?.currentPeriodEnd && (
                <p className="text-xs text-white/40 mt-3">
                  {isPastDue
                    ? `Se cancela el ${formatDate(subscription.currentPeriodEnd)}`
                    : isCanceling
                    ? `Activo hasta el ${formatDate(subscription.currentPeriodEnd)} · no se renueva`
                    : `Próximo cobro: ${formatDate(subscription.currentPeriodEnd)}`}
                </p>
              )}
            </div>

            {!isCanceling && <ChangeCardForm email={session.user.email} />}

            <div className={!isCanceling ? "mt-3" : undefined}>
              <Button size="lg" variant="secondary" className="w-full" asChild>
                <Link href="/dashboard">Ir al dashboard</Link>
              </Button>
            </div>
          </div>

          <div className="text-center mt-5 flex items-center justify-center gap-3">
            {!isCanceling && !isPastDue && subscription && (
              <>
                <Link
                  href="/dashboard/upgrade/cancel"
                  className="text-xs text-mute hover:text-ink transition-colors"
                >
                  Cancelar suscripción
                </Link>
                <span className="text-hairline-strong">·</span>
              </>
            )}
            <a href={PLAN_SUPPORT_MAILTO} className="text-xs text-mute hover:text-ink transition-colors">
              ¿Problemas con tu plan? Escríbenos
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-start justify-center p-6 lg:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-ink mb-4">
            <Zap className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-black text-ink tracking-tighter">
            Pasa a Pro
          </h1>
          <p className="text-sm text-body mt-1">
            Sin permanencia · Cancela cuando quieras
          </p>
        </div>

        <div className="rounded-3xl bg-ink text-white p-7">
          <div className="mb-6 pb-6 border-b border-white/10">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tighter">$99.999</span>
              <span className="text-base font-medium text-white/50">/mes</span>
            </div>
            <p className="text-xs text-white/40 mt-1">COP · facturación mensual</p>
          </div>

          <ul className="space-y-3 mb-7">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15 flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
                {f}
              </li>
              ))}
            </ul>

            <div className="mb-7 border-t border-white/10 pt-6">
              <p className="mb-4 text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                Lo que cambia con Pro
              </p>
              <div className="space-y-4">
                {PRO_VALUE_POINTS.map((point, pointIndex) => (
                  <div key={point.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white text-ink">
                      {pointIndex === 0 ? <Sparkles className="h-3 w-3" strokeWidth={2.5} /> : <span className="text-[10px] font-black">0{pointIndex + 1}</span>}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{point.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/55">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs font-medium text-white/50 mb-3">
              Se renueva automáticamente cada mes · Cancela cuando quieras
            </p>
            <SubscribeCardForm email={session.user.email} />
        </div>

        <Suspense fallback={null}>
          <UpgradeErrorToast />
        </Suspense>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-mute">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
          Pago seguro con Mercado Pago ·{" "}
          <a href={PLAN_SUPPORT_MAILTO} className="hover:text-ink transition-colors">
            Conexory@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
}
