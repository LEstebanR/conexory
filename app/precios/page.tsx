import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Reveal from "@/components/reveal"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Precios — Conexory",
  description: "Planes y precios de Conexory para agentes inmobiliarios en Colombia.",
}

const plans = [
  {
    name: "Gratuito",
    price: "$0",
    cadence: "Para siempre",
    cta: "Empezar gratis",
    href: "/register",
    dark: false,
    featured: false,
    features: [
      "Hasta 3 propiedades activas",
      "Hasta 10 fotos por propiedad",
      "Link único por propiedad",
      "Compartir por WhatsApp",
      "Vista pública para tus clientes",
      "Contador de veces compartida",
    ],
  },
  {
    name: "Pro",
    price: "$99.999",
    priceSuffix: "/mes",
    cadence: "COP · facturación mensual",
    cta: "Comenzar con Pro",
    href: "/register",
    dark: true,
    featured: true,
    features: [
      "Hasta 50 propiedades activas",
      "Hasta 20 fotos por propiedad",
    ],
  },
  {
    name: "Personalizado",
    price: "A tu medida",
    cadence: "Para equipos y agencias",
    cta: "Contáctanos",
    href: "/contacto",
    dark: false,
    featured: false,
    features: [
      "Propiedades ilimitadas",
      "Fotos ilimitadas por propiedad",
      "Soporte dedicado",
      "Integraciones a la medida",
    ],
  },
]

export default function PreciosPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]">
          <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
            <defs>
              <pattern id="precios-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#000000" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#precios-dots)" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <p className="text-body font-semibold text-sm uppercase tracking-[0.2em] mb-5 animate-fade-up">
            Precios
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black text-ink tracking-tighter leading-[1.05] animate-fade-up text-balance"
            style={{ animationDelay: "80ms" }}
          >
            Empieza gratis.
            <br />
            <span className="text-mute">Crece sin límites.</span>
          </h1>
          <p
            className="text-lg text-body leading-relaxed mt-6 max-w-xl mx-auto animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            Sin tarjeta de crédito. Sin compromisos. Cancela cuando quieras.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto w-full px-5 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100} className="h-full">
              <div
                className={`relative h-full rounded-3xl p-8 flex flex-col ${
                  plan.dark
                    ? "bg-ink text-white lg:scale-[1.03] shadow-2xl shadow-black/20"
                    : "bg-white border border-hairline-strong"
                }`}
              >
                {plan.featured && (
                  <span className="absolute top-6 right-6 bg-white text-ink text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Más popular
                  </span>
                )}
                <div className="mb-8">
                  <p
                    className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                      plan.dark ? "text-mute" : "text-mute"
                    }`}
                  >
                    {plan.name}
                  </p>
                  <p className={`text-5xl font-black tracking-tighter ${plan.dark ? "text-white" : "text-ink"}`}>
                    {plan.price}
                    {plan.priceSuffix && (
                      <span className="text-xl font-semibold text-mute">{plan.priceSuffix}</span>
                    )}
                  </p>
                  <p className="text-sm text-mute mt-2">{plan.cadence}</p>
                </div>

                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2.5 text-sm ${plan.dark ? "text-white/80" : "text-body"}`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full flex-shrink-0 ${
                          plan.dark ? "bg-white" : "bg-ink"
                        }`}
                      >
                        <Check className={`w-2.5 h-2.5 ${plan.dark ? "text-ink" : "text-white"}`} strokeWidth={3.5} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.dark ? "secondary" : plan.featured ? "default" : "outline"}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="text-center text-sm text-mute mt-10">
          Todos los planes incluyen link público, preview de WhatsApp y soporte en español.
        </p>
      </section>

      <Footer />
    </main>
  )
}
