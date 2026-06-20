import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Check, Zap, ShieldCheck } from "lucide-react"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { startSubscription } from "./actions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Plan Pro — Conexory",
}

const PRO_FEATURES = [
  "Hasta 50 propiedades activas",
  "Hasta 20 fotos por propiedad",
  "Estadísticas de visitas por propiedad",
  "Link único por propiedad",
  "Vista pública para tus clientes",
  "Soporte prioritario",
]

export default async function UpgradePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  if (session.user.isPremium) redirect("/dashboard")

  return (
    <div className="flex-1 flex items-start justify-center p-6 lg:p-10">
      <div className="w-full max-w-sm">
        {/* Header */}
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

        {/* Card */}
        <div className="rounded-3xl bg-ink text-white p-7">
          {/* Price */}
          <div className="mb-6 pb-6 border-b border-white/10">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black tracking-tighter">$99.999</span>
              <span className="text-base font-medium text-white/50">/mes</span>
            </div>
            <p className="text-xs text-white/40 mt-1">COP · facturación mensual</p>
          </div>

          {/* Features */}
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

          {/* CTA */}
          <form action={startSubscription}>
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
            >
              <Zap className="w-4 h-4" />
              Suscribirme — $99.999/mes
            </Button>
          </form>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-mute">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
          Pago seguro con Wompi · hola@conexory.com
        </div>
      </div>
    </div>
  )
}
