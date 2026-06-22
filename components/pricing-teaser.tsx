import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import Reveal from "@/components/reveal"

const plans = [
  {
    name: "Gratuito",
    price: "$0",
    cadence: "Para siempre",
    dark: false,
    features: [
      "3 propiedades activas",
      "10 fotos por propiedad",
      "Link único por propiedad",
      "Preview profesional al compartir",
    ],
    cta: "Empezar gratis",
    href: "/register",
  },
  {
    name: "Pro",
    price: "$99.999",
    cadence: "COP / mes",
    dark: true,
    features: [
      "50 propiedades activas",
      "20 fotos por propiedad",
      "Todo lo del plan gratuito",
      "Sin permanencia — cancela cuando quieras",
    ],
    cta: "Comenzar con Pro",
    href: "/login?redirect=/dashboard/upgrade",
  },
]

export default function PricingTeaser() {
  return (
    <section id="pricing" className="py-24 bg-canvas-softer">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <p className="text-body font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            Planes
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-ink tracking-tighter leading-none">
            Empieza gratis.
            <br />
            <span className="text-mute">Crece sin límites.</span>
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <div className="grid sm:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-7 flex flex-col gap-6 ${
                  plan.dark
                    ? "bg-ink text-white"
                    : "bg-white border border-hairline"
                }`}
              >
                {/* Header */}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.dark ? "text-white/40" : "text-mute"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-4xl font-black tracking-tighter ${plan.dark ? "text-white" : "text-ink"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm font-medium ${plan.dark ? "text-white/40" : "text-mute"}`}>
                      {plan.cadence}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.dark ? "text-white/80" : "text-body"}`}>
                      <span className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full flex-shrink-0 ${plan.dark ? "bg-white/15" : "bg-ink"}`}>
                        <Check className={`w-2.5 h-2.5 ${plan.dark ? "text-white" : "text-white"}`} strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={`flex items-center justify-center h-11 rounded-full text-sm font-bold transition-colors ${
                    plan.dark
                      ? "bg-white text-ink hover:bg-canvas-soft"
                      : "bg-ink text-white hover:bg-elevated"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="text-center mt-8">
            <Link
              href="/precios"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-body hover:text-ink transition-colors"
            >
              Ver todos los planes y comparar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
