import Link from "next/link"
import { FREE_PROPERTY_LIMIT, PRO_PROPERTY_LIMIT } from "@/lib/plans"
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
    cta: "Crear cuenta gratis",
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
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-ink tracking-tight leading-none">
            {FREE_PROPERTY_LIMIT} propiedades gratis.
            <br />
            <span className="text-mute">{PRO_PROPERTY_LIMIT} cuando tu cartera crezca.</span>
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
                  <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.dark ? "text-white/70" : "text-mute"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-4xl font-black tracking-tighter ${plan.dark ? "text-white" : "text-ink"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm font-medium ${plan.dark ? "text-white/70" : "text-mute"}`}>
                      {plan.cadence}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className={`space-y-2.5 flex-1 border-l-2 pl-4 ${plan.dark ? "border-white" : "border-ink"}`}>
                  {plan.features.map((f) => (
                    <li key={f} className={`text-sm ${plan.dark ? "text-white/90" : "text-body"}`}>
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
              className="text-sm font-semibold text-body underline underline-offset-4 hover:text-ink transition-colors"
            >
              Ver todos los planes y comparar
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
