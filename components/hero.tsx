"use client"

import { Building2, MessageCircle, Link2, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[268px] sm:w-[300px] select-none">
      {/* Glow */}
      <div className="absolute inset-4 bg-brand-400/25 rounded-[3rem] blur-3xl" />

      {/* Phone outer shell */}
      <div className="relative bg-slate-900 rounded-[2.8rem] p-[10px] shadow-2xl shadow-slate-900/40">
        {/* Screen */}
        <div className="bg-white rounded-[2.2rem] overflow-hidden">
          {/* Dynamic island */}
          <div className="flex justify-center pt-3 pb-2 bg-white">
            <div className="w-24 h-1.5 bg-slate-200 rounded-full" />
          </div>

          {/* App bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-brand-400 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-slate-800 tracking-tight">MiAgente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
              <span className="text-[9px] text-slate-400 font-medium">En línea</span>
            </div>
          </div>

          {/* Property photo */}
          <div className="relative h-40 bg-gradient-to-br from-brand-200 via-brand-300 to-brand-500 overflow-hidden">
            {/* Simulated building shapes */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="grid grid-cols-3 gap-1 w-32">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white/60 rounded h-8" />
                ))}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 p-3 right-0">
              <p className="text-[9px] text-white/70 font-medium">Laureles · Medellín</p>
              <p className="text-xs font-bold text-white leading-tight">Casa con jardín privado</p>
            </div>
            <div className="absolute top-2.5 right-2.5 bg-brand-400 text-white text-[8px] font-bold px-2 py-1 rounded-full">
              En venta
            </div>
          </div>

          {/* Property details */}
          <div className="p-3.5 space-y-3">
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Precio</p>
              <p className="text-xl font-black text-slate-900 tracking-tight leading-none">
                $580.000.000
              </p>
              <p className="text-[10px] text-slate-500 font-medium">COP</p>
            </div>

            <div className="flex gap-3">
              {[
                { e: "🛏", v: "3 hab" },
                { e: "🚿", v: "2 baños" },
                { e: "📐", v: "120m²" },
              ].map((d) => (
                <span key={d.v} className="text-[9px] text-slate-500 font-medium">
                  {d.e} {d.v}
                </span>
              ))}
            </div>

            {/* Share buttons */}
            <div className="space-y-1.5 pt-0.5">
              <div className="w-full bg-[#25D366] rounded-xl py-2.5 flex items-center justify-center gap-1.5">
                <MessageCircle className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold text-white">Enviar por WhatsApp</span>
              </div>
              <div className="w-full bg-slate-100 rounded-xl py-2 flex items-center justify-center gap-1.5">
                <Link2 className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] font-semibold text-slate-600">Copiar link</span>
              </div>
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center py-2.5">
            <div className="w-20 h-1 bg-slate-200 rounded-full" />
          </div>
        </div>
      </div>

      {/* Floating: link copied */}
      <div className="absolute -top-5 -right-8 bg-white rounded-2xl shadow-xl border border-slate-100/80 px-3 py-2 flex items-center gap-2 z-10">
        <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
        <div>
          <p className="text-[10px] font-bold text-slate-800">Link copiado ✓</p>
          <p className="text-[9px] text-slate-400">miagente.co/p/casa-laureles</p>
        </div>
      </div>

      {/* Floating: WhatsApp */}
      <div className="absolute -bottom-5 -left-10 bg-white rounded-2xl shadow-xl border border-slate-100/80 px-3 py-2.5 flex items-center gap-2.5 z-10">
        <div className="w-7 h-7 rounded-full bg-[#25D366]/15 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-800">3 interesados hoy</p>
          <p className="text-[9px] text-slate-400">vía WhatsApp</p>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-white">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#0f172a" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
        {/* Green accent blob */}
        <div className="absolute top-0 right-0 w-[55%] h-[80%] rounded-bl-[120px] bg-gradient-to-bl from-brand-50 via-brand-50/40 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <div className="space-y-9 max-w-2xl">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-sm font-semibold text-brand-700">
                La forma más rápida de compartir propiedades
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="font-black tracking-tighter leading-none text-slate-950">
                <span className="block text-6xl sm:text-7xl lg:text-8xl">Crea</span>
                <span className="block text-6xl sm:text-7xl lg:text-8xl text-brand-400">
                  Comparte
                </span>
                <span className="block text-6xl sm:text-7xl lg:text-8xl">Vende</span>
              </h1>
            </div>

            <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
              Sube las fotos, escribe el precio y obtén tu link en segundos. Compártelo
              por WhatsApp y empieza a recibir interesados. Sin portales. Sin complicaciones.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button size="xl" className="font-bold text-base shadow-lg shadow-brand-400/25 h-14 px-8" asChild>
                <a href="/register">
                  Empezar gratis <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
              <p className="text-sm text-slate-400">
                Sin tarjeta de crédito · 100% desde el celular
              </p>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {[
                  { bg: "bg-amber-400", l: "C" },
                  { bg: "bg-blue-500", l: "M" },
                  { bg: "bg-violet-500", l: "A" },
                  { bg: "bg-rose-400", l: "R" },
                  { bg: "bg-teal-500", l: "J" },
                ].map((a, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full ${a.bg} border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                  >
                    {a.l}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">+480 agentes activos</p>
                <p className="text-xs text-slate-500">Bogotá · Medellín · Cali · y más</p>
              </div>
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div className="hidden lg:flex justify-center lg:justify-end items-center py-10 pr-6">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
