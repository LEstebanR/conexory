import type { Metadata } from "next"
import Link from "next/link"
import { Building2, ArrowLeft, Check } from "lucide-react"

export const metadata: Metadata = {
  title: "Precios — MiAgente",
  description: "Planes y precios de MiAgente para agentes inmobiliarios en Colombia.",
}

const features = {
  gratis: [
    "Hasta 3 propiedades activas",
    "Link único por propiedad",
    "Compartir por WhatsApp",
    "Galería de fotos (hasta 10 por propiedad)",
    "Vista pública para tus clientes",
    "Contador de veces compartida",
  ],
  pro: [
    "Propiedades ilimitadas",
    "Hasta 20 fotos por propiedad",
    "Estadísticas de visitas por propiedad",
    "Soporte prioritario",
    "Todo lo del plan gratuito",
  ],
}

export default function PreciosPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-400 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-black text-slate-950 tracking-tight">
              MiAgente
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="bg-slate-950 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">
            Precios
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Empieza gratis. Crece sin límites.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Sin tarjeta de crédito. Sin compromisos. Cancela cuando quieras.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {/* Gratis */}
          <div className="border border-slate-200 rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gratuito</p>
              <p className="text-4xl font-black text-slate-950 tracking-tighter mb-1">$0</p>
              <p className="text-sm text-slate-400">Para siempre</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {features.gratis.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="w-full flex items-center justify-center h-11 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Pro */}
          <div className="border-2 border-brand-400 rounded-2xl p-8 flex flex-col bg-brand-50/20 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-brand-400 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
                Próximamente
              </span>
            </div>
            <div className="mb-6">
              <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-2">Pro</p>
              <p className="text-4xl font-black text-slate-950 tracking-tighter mb-1">
                $99.999
                <span className="text-lg font-semibold text-slate-400">/mes</span>
              </p>
              <p className="text-sm text-slate-400">COP · facturación mensual</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {features.pro.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full flex items-center justify-center h-11 rounded-xl bg-brand-400/50 text-white font-bold text-sm cursor-not-allowed"
            >
              Disponible pronto
            </button>
          </div>
        </div>

      </main>

      <footer className="border-t border-slate-100 py-8 text-center">
        <p className="text-xs text-slate-400">
          © 2026 MiAgente · Hecho con 🇨🇴 en Colombia
        </p>
      </footer>
    </div>
  )
}
