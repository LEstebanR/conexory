"use client"

import { Building2, MessageCircle, Link2, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[268px] sm:w-[300px] select-none">
      {/* Phone outer shell */}
      <div className="relative bg-ink rounded-[2.8rem] p-[10px] shadow-2xl shadow-black/30">
        {/* Screen */}
        <div className="bg-white rounded-[2.2rem] overflow-hidden">
          {/* Dynamic island */}
          <div className="flex justify-center pt-3 pb-2 bg-white">
            <div className="w-24 h-1.5 bg-canvas-soft rounded-full" />
          </div>

          {/* App bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-hairline">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-ink flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-ink tracking-tight">Conexory</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-ink" />
              <span className="text-[9px] text-mute font-medium">En línea</span>
            </div>
          </div>

          {/* Property photo */}
          <div className="relative h-40 bg-gradient-to-br from-brand-200 via-brand-300 to-brand-600 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
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
            <div className="absolute top-2.5 right-2.5 bg-ink text-white text-[8px] font-bold px-2 py-1 rounded-full">
              En venta
            </div>
          </div>

          {/* Property details */}
          <div className="p-3.5 space-y-3">
            <div>
              <p className="text-[9px] text-mute uppercase tracking-wider font-semibold">Precio</p>
              <p className="text-xl font-black text-ink tracking-tight leading-none">
                $580.000.000
              </p>
              <p className="text-[10px] text-body font-medium">COP</p>
            </div>

            <div className="flex gap-3">
              {[
                { e: "🛏", v: "3 hab" },
                { e: "🚿", v: "2 baños" },
                { e: "📐", v: "120m²" },
              ].map((d) => (
                <span key={d.v} className="text-[9px] text-body font-medium">
                  {d.e} {d.v}
                </span>
              ))}
            </div>

            {/* Share buttons */}
            <div className="space-y-1.5 pt-0.5">
              <div className="w-full bg-[#25D366] rounded-full py-2.5 flex items-center justify-center gap-1.5">
                <MessageCircle className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold text-white">Enviar por WhatsApp</span>
              </div>
              <div className="w-full bg-canvas-soft rounded-full py-2 flex items-center justify-center gap-1.5">
                <Link2 className="w-3 h-3 text-body" />
                <span className="text-[10px] font-semibold text-body">Copiar link</span>
              </div>
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center py-2.5">
            <div className="w-20 h-1 bg-canvas-soft rounded-full" />
          </div>
        </div>
      </div>

      {/* Floating: link copied */}
      <div className="absolute -top-5 -right-8 bg-white rounded-2xl shadow-xl border border-hairline px-3 py-2 flex items-center gap-2 z-10">
        <CheckCircle2 className="w-4 h-4 text-ink flex-shrink-0" />
        <div>
          <p className="text-[10px] font-bold text-ink">Link copiado ✓</p>
          <p className="text-[9px] text-mute">conexory.com/p/casa-laureles</p>
        </div>
      </div>

      {/* Floating: WhatsApp */}
      <div className="absolute -bottom-5 -left-10 bg-white rounded-2xl shadow-xl border border-hairline px-3 py-2.5 flex items-center gap-2.5 z-10">
        <div className="w-7 h-7 rounded-full bg-[#25D366]/15 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-ink">3 interesados hoy</p>
          <p className="text-[9px] text-mute">vía WhatsApp</p>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-white">
      {/* Background dot grid */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#000000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
          {/* Left: Copy */}
          <div className="space-y-9 max-w-2xl">
            {/* Tag */}
            <div
              className="inline-flex items-center gap-2 bg-canvas-soft rounded-full px-4 py-2 animate-fade-up"
              style={{ animationDelay: "0ms" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-ink animate-pulse" />
              <span className="text-sm font-medium text-ink">
                La forma más rápida de compartir propiedades
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-black tracking-tighter leading-none text-ink animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              <span className="block text-6xl sm:text-7xl lg:text-8xl">Crea.</span>
              <span className="block text-6xl sm:text-7xl lg:text-8xl text-mute">Comparte.</span>
              <span className="block text-6xl sm:text-7xl lg:text-8xl">Vende.</span>
            </h1>

            <p
              className="text-xl text-body leading-relaxed max-w-lg animate-fade-up"
              style={{ animationDelay: "160ms" }}
            >
              Sube las fotos, escribe el precio y obtén tu link en segundos. Compártelo
              por WhatsApp y empieza a recibir interesados. Sin portales. Sin complicaciones.
            </p>

            {/* CTA */}
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-up"
              style={{ animationDelay: "240ms" }}
            >
              <Button size="xl" className="h-14 px-8" asChild>
                <a href="/register">
                  Empezar gratis <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
              <p className="text-sm text-mute">
                Sin tarjeta de crédito · 100% desde el celular
              </p>
            </div>

            {/* Social proof */}
            <div
              className="flex items-center gap-4 pt-2 animate-fade-up"
              style={{ animationDelay: "320ms" }}
            >
              <div className="flex -space-x-2">
                {["C", "M", "A", "R", "J"].map((l, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full bg-ink border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-ink">+480 agentes activos</p>
                <p className="text-xs text-body">Bogotá · Medellín · Cali · y más</p>
              </div>
            </div>
          </div>

          {/* Right: Phone mockup */}
          <div
            className="hidden lg:flex justify-center lg:justify-end items-center py-10 pr-6 animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
