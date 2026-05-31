"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MessageCircle,
} from "lucide-react"

function DashboardMockup() {
  return (
    <div className="relative select-none pointer-events-none">
      {/* Glow behind mockup */}
      <div className="absolute inset-0 bg-brand-300/20 rounded-3xl blur-3xl scale-105" />

      {/* Browser frame */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-brand-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-md px-3 py-1 text-[11px] text-slate-400 border border-slate-200 w-48 truncate text-center">
              app.miagente.co/dashboard
            </div>
          </div>
        </div>

        {/* App content */}
        <div className="bg-slate-50 p-4 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">
                Hola, Carlos 👋
              </p>
              <p className="text-[10px] text-slate-500">
                5 leads nuevos hoy
              </p>
            </div>
            <div className="text-[10px] bg-brand-400 text-white px-2.5 py-1.5 rounded-lg font-semibold">
              + Propiedad
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Propiedades", value: "12", color: "text-slate-800" },
              { label: "Leads activos", value: "28", color: "text-blue-500" },
              { label: "Ventas mes", value: "5", color: "text-brand-500" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-xl p-2.5 border border-slate-100"
              >
                <p className={`text-base font-bold ${s.color} leading-none`}>
                  {s.value}
                </p>
                <p className="text-[9px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Properties */}
          <div>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Propiedades activas
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  title: "Apto. Chapinero",
                  city: "Bogotá",
                  price: "$280M",
                  badge: "Publicada",
                  from: "from-brand-200",
                  to: "to-brand-300",
                },
                {
                  title: "Casa El Poblado",
                  city: "Medellín",
                  price: "$950M",
                  badge: "Disponible",
                  from: "from-blue-200",
                  to: "to-blue-300",
                },
              ].map((prop) => (
                <div
                  key={prop.title}
                  className="bg-white rounded-xl overflow-hidden border border-slate-100"
                >
                  <div
                    className={`h-10 bg-gradient-to-br ${prop.from} ${prop.to} relative flex items-end p-1.5`}
                  >
                    <span className="text-[8px] bg-white/90 text-slate-700 px-1.5 py-0.5 rounded-full font-medium">
                      {prop.badge}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-semibold text-slate-800 truncate">
                      {prop.title}
                    </p>
                    <p className="text-[9px] text-slate-500">{prop.city}</p>
                    <p className="text-xs font-bold text-brand-500 mt-0.5">
                      {prop.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leads preview */}
          <div>
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Leads recientes
            </p>
            <div className="space-y-1.5">
              {[
                {
                  name: "María García",
                  prop: "Apto. Chapinero",
                  time: "5m",
                  dot: "bg-brand-400",
                },
                {
                  name: "Carlos López",
                  prop: "Casa El Poblado",
                  time: "1h",
                  dot: "bg-blue-400",
                },
              ].map((lead) => (
                <div
                  key={lead.name}
                  className="flex items-center gap-2 bg-white rounded-lg px-2.5 py-2 border border-slate-100"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${lead.dot} flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-800 truncate">
                      {lead.name}
                    </p>
                    <p className="text-[9px] text-slate-500 truncate">
                      {lead.prop}
                    </p>
                  </div>
                  <p className="text-[9px] text-slate-400 flex-shrink-0">
                    hace {lead.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating: Published */}
      <div className="absolute -top-4 -right-6 bg-white rounded-2xl shadow-xl border border-slate-100 px-3.5 py-2.5 flex items-center gap-2.5 max-w-[210px]">
        <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-brand-500" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-800">
            Publicado en 2 portales
          </p>
          <p className="text-[10px] text-slate-500">
            Vivanuncios · Fincaraíz
          </p>
        </div>
      </div>

      {/* Floating: WhatsApp lead */}
      <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-xl border border-slate-100 px-3.5 py-2.5 flex items-center gap-2.5 max-w-[200px]">
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-800">
            Nuevo lead
          </p>
          <p className="text-[10px] text-slate-500">María vía WhatsApp</p>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Error desconocido")

      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full bg-brand-100/30 blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-brand-50/50 blur-3xl" />
        {/* Dot grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.035]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1.5" cy="1.5" r="1.5" fill="#0f172a" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left: Copy + Form */}
          <div className="space-y-8 max-w-xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-sm font-semibold text-brand-700">
                Acceso anticipado — lista de espera abierta
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-5">
              <h1 className="text-5xl sm:text-[56px] font-bold text-slate-900 leading-[1.1] tracking-tight">
                Vende y arrienda más.{" "}
                <span className="relative inline-block text-brand-400">
                  Sin complicaciones.
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="6"
                    viewBox="0 0 380 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 4C80 1.5 200 1 379 4"
                      stroke="#41b883"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                El CRM inmobiliario diseñado para agentes colombianos. Publica
                en múltiples portales con un click, gestiona tus leads y ten tu
                propia web en minutos.
              </p>
            </div>

            {/* Waitlist form */}
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 h-12 text-base"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="sm:shrink-0 h-12 font-bold"
                  >
                    {loading ? (
                      "Uniendo..."
                    ) : (
                      <>
                        Ser de los primeros{" "}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <p className="text-sm text-slate-500">
                  Sin spam · Sin tarjeta de crédito · Cancela cuando quieras
                </p>
              </form>
            ) : (
              <div className="flex items-start gap-3 bg-brand-50 border border-brand-200 rounded-2xl p-5">
                <CheckCircle2 className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-brand-900">
                    ¡Perfecto! Estás en la lista 🎉
                  </p>
                  <p className="text-sm text-brand-700 mt-1">
                    Te avisaremos cuando lancemos. Prepárate para
                    transformar tu negocio.
                  </p>
                </div>
              </div>
            )}

            {/* Social proof avatars */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {[
                  { bg: "bg-amber-400", letter: "C" },
                  { bg: "bg-blue-500", letter: "M" },
                  { bg: "bg-violet-500", letter: "A" },
                  { bg: "bg-rose-400", letter: "R" },
                ].map((a, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full ${a.bg} border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                  >
                    {a.letter}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  +480 agentes en lista de espera
                </p>
                <p className="text-xs text-slate-500">
                  Bogotá, Medellín, Cali y más ciudades
                </p>
              </div>
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <div className="hidden lg:block relative pl-8">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
