import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

const plans = [
  {
    name: "Beta gratuita",
    price: "$0",
    period: "/mes durante beta",
    description: "Acceso completo mientras lanzamos",
    accent: false,
    cta: "Únete al waitlist →",
    features: [
      "Hasta 10 propiedades activas",
      "Publicación en 3 portales",
      "Gestión de leads ilimitada",
      "Tu página web propia",
      "WhatsApp integrado",
    ],
  },
  {
    name: "Pro",
    price: "$79.900",
    period: "/mes en COP",
    description: "~$20 USD. 60% menos que Wasi.",
    accent: true,
    cta: "Acceso anticipado con 50% off →",
    features: [
      "Propiedades ilimitadas",
      "Publicación multi-portal automática",
      "CRM de leads completo (Kanban)",
      "Página web con dominio propio",
      "WhatsApp + Instagram integrado",
      "Analytics de propiedades",
      "Soporte prioritario 24/7",
    ],
  },
]

export default function PricingPreview() {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <Badge className="mb-4">Precios</Badge>
          <h2 className="text-4xl sm:text-[42px] font-bold text-slate-900 mb-5 leading-tight tracking-tight">
            Sin sorpresas
            <br />
            <span className="text-brand-400">en tu factura</span>
          </h2>
          <p className="text-lg text-slate-600">
            Precios en pesos colombianos. Sin cargos en dólares. Sin
            conversiones.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl ${
                plan.accent
                  ? "border-2 border-brand-400 bg-gradient-to-br from-brand-50/60 via-white to-white shadow-lg shadow-brand-100"
                  : "border border-slate-200 bg-white"
              }`}
            >
              {plan.accent && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2">
                  <div className="bg-brand-400 text-white text-xs font-bold px-4 py-1.5 rounded-b-xl shadow-sm">
                    Más popular
                  </div>
                </div>
              )}

              <div className="mb-7">
                <p
                  className={`text-sm font-bold uppercase tracking-wider mb-3 ${
                    plan.accent ? "text-brand-600" : "text-slate-500"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-bold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-slate-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        plan.accent ? "text-brand-400" : "text-brand-400"
                      }`}
                    />
                    {feat}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.accent ? "default" : "secondary"}
                size="lg"
                className="w-full font-bold"
                asChild
              >
                <a href="#waitlist">{plan.cta}</a>
              </Button>
            </div>
          ))}
        </div>

        {/* Comparison banner */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <p className="text-sm text-slate-600 leading-relaxed">
            💡{" "}
            <span className="font-semibold text-slate-800">
              Comparado con Wasi:
            </span>{" "}
            Sus planes empiezan en{" "}
            <span className="line-through text-slate-400">$50 USD/mes</span>{" "}
            (~$200.000 COP). MiAgente Pro cuesta{" "}
            <span className="text-brand-600 font-semibold">
              $79.900 COP/mes
            </span>{" "}
            — el mismo poder, 60% menos.
          </p>
        </div>
      </div>
    </section>
  )
}
