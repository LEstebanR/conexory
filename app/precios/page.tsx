import type { Metadata } from "next"
import Link from "next/link"
import { Building2, ArrowLeft, Check } from "lucide-react"

export const metadata: Metadata = {
  title: "Precios — Conexory",
  description: "Planes y precios de Conexory para agentes inmobiliarios en Colombia.",
}

const features = {
  gratis: [
    "Hasta 3 propiedades activas",
    "Hasta 10 fotos por propiedad",
    "Link único por propiedad",
    "Compartir por WhatsApp",
    "Vista pública para tus clientes",
    "Contador de veces compartida",
  ],
  pro: [
    "Hasta 50 propiedades activas",
    "Hasta 20 fotos por propiedad",
    "Estadísticas de visitas por propiedad",
    "Soporte prioritario",
    "Todo lo del plan gratuito",
  ],
  personalizado: [
    "Propiedades ilimitadas",
    "Fotos ilimitadas por propiedad",
    "Soporte dedicado",
    "Integraciones a la medida",
    "Todo lo del plan Pro",
  ],
}

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-hairline">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-black text-ink tracking-tight">
              Conexory
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-body hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="bg-ink py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-mute font-bold text-xs uppercase tracking-[0.2em] mb-4">
            Precios
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Empieza gratis. Crece sin límites.
          </h1>
          <p className="text-mute text-base leading-relaxed">
            Sin tarjeta de crédito. Sin compromisos. Cancela cuando quieras.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Gratis */}
          <div className="border border-hairline-strong rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-bold text-mute uppercase tracking-widest mb-2">Gratuito</p>
              <p className="text-4xl font-black text-ink tracking-tighter mb-1">$0</p>
              <p className="text-sm text-mute">Para siempre</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {features.gratis.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-body">
                  <Check className="w-4 h-4 text-ink flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="w-full flex items-center justify-center h-11 rounded-xl border-2 border-hairline-strong text-ink font-bold text-sm hover:border-ink hover:bg-canvas-softer transition-colors"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Pro */}
          <div className="border-2 border-ink rounded-2xl p-8 flex flex-col bg-canvas-soft/20 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-ink text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                Más popular
              </span>
            </div>
            <div className="mb-6">
              <p className="text-xs font-bold text-ink uppercase tracking-widest mb-2">Pro</p>
              <p className="text-4xl font-black text-ink tracking-tighter mb-1">
                $99.999
                <span className="text-lg font-semibold text-mute">/mes</span>
              </p>
              <p className="text-sm text-mute">COP · facturación mensual</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {features.pro.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-body">
                  <Check className="w-4 h-4 text-ink flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="w-full flex items-center justify-center h-11 rounded-xl bg-ink text-white font-bold text-sm hover:bg-elevated transition-colors"
            >
              Comenzar con Pro
            </Link>
          </div>

          {/* Personalizado */}
          <div className="border border-hairline-strong rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-bold text-mute uppercase tracking-widest mb-2">Personalizado</p>
              <p className="text-4xl font-black text-ink tracking-tighter mb-1">A tu medida</p>
              <p className="text-sm text-mute">Para equipos y agencias</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {features.personalizado.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-body">
                  <Check className="w-4 h-4 text-ink flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/contacto"
              className="w-full flex items-center justify-center h-11 rounded-xl border-2 border-hairline-strong text-ink font-bold text-sm hover:border-ink hover:bg-canvas-softer transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>

      </main>

      <footer className="border-t border-hairline py-8 text-center">
        <p className="text-xs text-mute">
          © 2026 Conexory · Hecho en Colombia
        </p>
      </footer>
    </div>
  )
}
