"use client"

import { MessageCircle, ArrowRight, MapPin, BedDouble, Bath, Maximize2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

function BrowserMock() {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      {/* Browser frame */}
      <div className="rounded-2xl border border-hairline bg-white shadow-2xl shadow-black/10 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 h-11 border-b border-hairline bg-canvas-softer">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-surface-pressed" />
            <span className="w-3 h-3 rounded-full bg-surface-pressed" />
            <span className="w-3 h-3 rounded-full bg-surface-pressed" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 bg-white border border-hairline rounded-full px-3 py-1 text-xs text-body max-w-xs w-full justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-ink" />
              <span className="truncate">conexory.com/p/casa-laureles</span>
            </div>
          </div>
          <div className="w-12" />
        </div>

        {/* Public property page mock */}
        <div className="grid sm:grid-cols-2">
          {/* Photo */}
          <div className="relative h-48 sm:h-full min-h-[220px] bg-gradient-to-br from-brand-100 via-brand-200 to-brand-400 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="grid grid-cols-4 gap-1.5 w-44">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={`bg-white rounded-sm ${i < 4 ? "h-14" : i < 8 ? "h-10" : "h-7"}`} />
                ))}
              </div>
            </div>
            <div className="absolute top-3 left-3 bg-ink text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              En venta
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-1.5 text-xs text-body font-medium">
              <MapPin className="w-3.5 h-3.5" />
              Laureles · Medellín
            </div>
            <h3 className="text-xl font-black text-ink tracking-tight leading-tight">
              Casa con jardín privado
            </h3>
            <div>
              <p className="text-2xl font-black text-ink tracking-tighter leading-none">$580.000.000</p>
              <p className="text-xs text-mute font-medium mt-0.5">COP</p>
            </div>
            <div className="flex items-center gap-4 py-3 border-t border-b border-hairline">
              {[
                { icon: BedDouble, label: "3" },
                { icon: Bath, label: "2" },
                { icon: Maximize2, label: "120m²" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1 text-sm text-ink font-semibold">
                  <Icon className="w-4 h-4 text-body" strokeWidth={1.75} />
                  {label}
                </div>
              ))}
            </div>
            <div className="w-full flex items-center justify-center gap-2 bg-ink rounded-full py-3">
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">Contactar por WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating: link copied */}
      <div className="hidden sm:flex absolute -top-5 -left-6 bg-white rounded-full shadow-xl border border-hairline px-4 py-2.5 items-center gap-2 z-10 animate-fade-up" style={{ animationDelay: "500ms" }}>
        <div className="w-5 h-5 rounded-full bg-ink flex items-center justify-center">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
        <span className="text-xs font-bold text-ink">Link copiado</span>
      </div>

      {/* Floating: interested */}
      <div className="hidden sm:flex absolute -bottom-5 -right-6 bg-white rounded-full shadow-xl border border-hairline px-4 py-2.5 items-center gap-2 z-10 animate-fade-up" style={{ animationDelay: "650ms" }}>
        <MessageCircle className="w-4 h-4 text-ink" />
        <span className="text-xs font-bold text-ink">+3 interesados hoy</span>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-white">
      {/* Background dot grid fading out */}
      <div className="absolute inset-0 -z-10 overflow-hidden [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]">
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
          <defs>
            <pattern id="hero-dots" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#000000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 bg-canvas-soft rounded-full pl-1.5 pr-3.5 py-1.5 mb-8 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <span className="flex items-center gap-1 bg-ink text-white text-[11px] font-bold rounded-full px-2 py-0.5">
            Nuevo
          </span>
          <span className="text-sm font-medium text-ink">+480 agentes ya comparten con Conexory</span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-ink animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          Comparte propiedades
          <br />
          por WhatsApp en{" "}
          <span className="relative whitespace-nowrap">
            segundos
            <span className="absolute left-0 -bottom-1 w-full h-1.5 bg-ink rounded-full" />
          </span>
          .
        </h1>

        <p
          className="text-lg sm:text-xl text-body leading-relaxed max-w-2xl mx-auto mt-7 animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          Sube las fotos, escribe el precio y obtén un link único para cada
          propiedad. Compártelo por WhatsApp con una preview profesional. Sin
          portales, sin complicaciones.
        </p>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <Button size="xl" className="h-14 px-8 w-full sm:w-auto" asChild>
            <a href="/register">
              Empezar gratis <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
          <Button size="xl" variant="secondary" className="h-14 px-8 w-full sm:w-auto" asChild>
            <a href="#how-it-works">
              Ver cómo funciona
            </a>
          </Button>
        </div>
        <p className="text-sm text-mute mt-5 animate-fade-up" style={{ animationDelay: "300ms" }}>
          Gratis para siempre · Sin tarjeta de crédito · 100% desde el celular
        </p>
      </div>

      {/* Product mock */}
      <div
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-20 animate-fade-up"
        style={{ animationDelay: "360ms" }}
      >
        <BrowserMock />
      </div>
    </section>
  )
}
