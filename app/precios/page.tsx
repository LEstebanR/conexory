import type { Metadata } from "next"
import Link from "next/link"
import { Check, Minus } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Reveal from "@/components/reveal"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Precios — Conexory",
  description: "Planes y precios de Conexory para asesores inmobiliarios en Colombia.",
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
      "Preview enriquecida al compartir",
      "Vista pública para tus clientes",
      "Contador de veces compartida",
      "Perfil de agente con galería",
    ],
  },
  {
    name: "Pro",
    price: "$99.999",
    priceSuffix: "/mes",
    cadence: "COP · facturación mensual",
    cta: "Comenzar con Pro",
    href: "/login?redirect=/dashboard/upgrade",
    dark: true,
    featured: true,
    features: [
      "Hasta 50 propiedades activas",
      "Hasta 20 fotos por propiedad",
      "Link único por propiedad",
      "Preview enriquecida al compartir",
      "Vista pública para tus clientes",
      "Contador de veces compartida",
      "Perfil de agente con galería",
      "Sin permanencia — cancela cuando quieras",
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
      "Todo lo del plan Pro",
      "Soporte dedicado",
      "Integraciones a la medida",
    ],
  },
]

type CellValue = string | boolean

interface FeatureRow {
  label: string
  free: CellValue
  pro: CellValue
  custom: CellValue
}

interface FeatureGroup {
  group: string
  rows: FeatureRow[]
}

const comparison: FeatureGroup[] = [
  {
    group: "Propiedades y fotos",
    rows: [
      { label: "Propiedades activas", free: "3", pro: "50", custom: "Ilimitadas" },
      { label: "Fotos por propiedad", free: "10", pro: "20", custom: "Ilimitadas" },
    ],
  },
  {
    group: "Funciones",
    rows: [
      { label: "Link único por propiedad", free: true, pro: true, custom: true },
      { label: "Preview enriquecida al compartir", free: true, pro: true, custom: true },
      { label: "Vista pública para clientes", free: true, pro: true, custom: true },
      { label: "Contador de veces compartida", free: true, pro: true, custom: true },
      { label: "Perfil de agente con galería", free: true, pro: true, custom: true },
    ],
  },
  {
    group: "Soporte",
    rows: [
      { label: "Soporte en español", free: true, pro: true, custom: true },
      { label: "Soporte dedicado", free: false, pro: false, custom: true },
      { label: "Integraciones a la medida", free: false, pro: false, custom: true },
    ],
  },
]

function Cell({ value, dark }: { value: CellValue; dark?: boolean }) {
  if (value === true) {
    return (
      <span className={`flex h-5 w-5 items-center justify-center rounded-full mx-auto ${dark ? "bg-white" : "bg-ink"}`}>
        <Check className={`w-3 h-3 ${dark ? "text-ink" : "text-white"}`} strokeWidth={3.5} />
      </span>
    )
  }
  if (value === false) {
    return <Minus className="w-4 h-4 text-mute mx-auto" strokeWidth={2} />
  }
  return (
    <span className={`text-sm font-bold ${dark ? "text-white" : "text-ink"}`}>
      {value}
    </span>
  )
}

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
      <section className="max-w-6xl mx-auto w-full px-5 sm:px-6 lg:px-8 pb-16">
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
                  <p className="text-xs font-bold uppercase tracking-widest mb-3 text-mute">
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
                  variant={plan.dark ? "secondary" : "outline"}
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
      </section>

      {/* Comparison table */}
      <section className="bg-canvas-softer py-24">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <Reveal className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-ink tracking-tighter leading-none">
              Compara los planes
            </h2>
            <p className="text-body mt-3">Elige el que mejor se adapta a tu ritmo de trabajo.</p>
          </Reveal>

          <Reveal delay={60}>
            <div className="rounded-3xl overflow-hidden border border-hairline bg-white">
              {/* Table header */}
              <div className="grid grid-cols-4 border-b border-hairline">
                <div className="p-5" />
                {["Gratuito", "Pro", "Personalizado"].map((name, i) => (
                  <div
                    key={name}
                    className={`p-5 text-center ${i === 1 ? "bg-ink" : ""}`}
                  >
                    <p className={`text-xs font-bold uppercase tracking-widest ${i === 1 ? "text-white/50" : "text-mute"}`}>
                      {name}
                    </p>
                    <p className={`text-xl font-black mt-1 tracking-tight ${i === 1 ? "text-white" : "text-ink"}`}>
                      {i === 0 ? "$0" : i === 1 ? "$99.999" : "—"}
                    </p>
                    {i === 1 && (
                      <p className="text-[11px] text-white/40 mt-0.5">COP/mes</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Feature groups */}
              {comparison.map((section, si) => (
                <div key={section.group}>
                  {/* Group header */}
                  <div className="grid grid-cols-4 bg-canvas-softer border-b border-hairline">
                    <div className="col-span-4 px-5 py-2.5">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-mute">
                        {section.group}
                      </p>
                    </div>
                  </div>

                  {/* Rows */}
                  {section.rows.map((row, ri) => (
                    <div
                      key={row.label}
                      className={`grid grid-cols-4 border-b border-hairline last:border-b-0 ${
                        si === comparison.length - 1 && ri === section.rows.length - 1
                          ? "border-b-0"
                          : ""
                      }`}
                    >
                      <div className="px-5 py-4">
                        <span className="text-sm text-body">{row.label}</span>
                      </div>
                      <div className="px-5 py-4 flex items-center justify-center">
                        <Cell value={row.free} />
                      </div>
                      <div className="px-5 py-4 flex items-center justify-center bg-ink/[0.03]">
                        <Cell value={row.pro} />
                      </div>
                      <div className="px-5 py-4 flex items-center justify-center">
                        <Cell value={row.custom} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Footer row with CTAs */}
              <div className="grid grid-cols-4 border-t border-hairline bg-canvas-softer">
                <div className="p-5" />
                <div className="p-4 flex items-center justify-center">
                  <Link
                    href="/register"
                    className="text-xs font-bold text-ink underline underline-offset-4 hover:text-mute transition-colors"
                  >
                    Empezar gratis
                  </Link>
                </div>
                <div className="p-4 flex items-center justify-center bg-ink/[0.03]">
                  <Link
                    href="/login?redirect=/dashboard/upgrade"
                    className="text-xs font-bold text-ink underline underline-offset-4 hover:text-mute transition-colors"
                  >
                    Comenzar con Pro
                  </Link>
                </div>
                <div className="p-4 flex items-center justify-center">
                  <Link
                    href="/contacto"
                    className="text-xs font-bold text-ink underline underline-offset-4 hover:text-mute transition-colors"
                  >
                    Contáctanos
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>

          <p className="text-center text-sm text-mute mt-8">
            Todos los planes incluyen link público, preview enriquecida al compartir y soporte en español.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
