import Image from "next/image";
import { MessageCircle, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// Real screenshot of /p/[slug] — see components/hero.tsx history for the
// CSS mock this replaced. Regenerate via the same demo-data flow if the
// public ficha layout changes materially.
function BrowserMock() {
  return (
    <div className="relative mx-auto w-full max-w-xs sm:max-w-sm">
      <div className="rounded-[2rem] border border-hairline bg-white shadow-2xl shadow-black/10 overflow-hidden">
        <Image
          src="/marketing/hero-ficha.png"
          alt="Ficha pública de una propiedad en Conexory, con precio, ubicación y botón de WhatsApp"
          width={860}
          height={1600}
          sizes="(max-width: 640px) 320px, 384px"
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Floating: link copied */}
      <div
        className="hidden sm:flex absolute -top-5 -left-10 bg-white rounded-full shadow-xl border border-hairline px-4 py-2.5 items-center gap-2 z-10 animate-fade-up"
        style={{ animationDelay: "500ms" }}
      >
        <div className="w-5 h-5 rounded-full bg-ink flex items-center justify-center">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
        <span className="text-xs font-bold text-ink">Link copiado</span>
      </div>

      {/* Floating: shares count */}
      <div
        className="hidden sm:flex absolute -bottom-5 -right-10 bg-white rounded-full shadow-xl border border-hairline px-4 py-2.5 items-center gap-2 z-10 animate-fade-up"
        style={{ animationDelay: "650ms" }}
      >
        <MessageCircle className="w-4 h-4 text-ink" />
        <span className="text-xs font-bold text-ink">+3 interesados hoy</span>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden bg-white">
      {/* Background dot grid fading out */}
      <div className="absolute inset-0 -z-10 overflow-hidden [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]">
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
          <defs>
            <pattern
              id="hero-dots"
              x="0"
              y="0"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="#000000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        {/* Badge — re-enable once we have real user count
        <div
          className="inline-flex max-w-full items-center gap-2 bg-canvas-soft rounded-full px-4 py-1.5 mb-10 animate-fade-up"
          style={{ animationDelay: "0ms" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-ink flex-shrink-0 animate-pulse" />
          <span className="text-xs sm:text-sm font-medium text-ink truncate">
            +100 agentes ya usan Conexory
          </span>
        </div>
        */}

        {/* Headline */}
        <h1
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] text-ink animate-fade-up text-balance"
          style={{ animationDelay: "80ms" }}
        >
          Publica y comparte propiedades en{" "}
          <span className="relative whitespace-nowrap">
            {/* Highlighter — behind text, slightly tilted */}
            <span
              aria-hidden="true"
              className="absolute -inset-x-1 top-[10%] bottom-[5%] -rotate-[0.6deg] rounded-[4px]"
              style={{ backgroundColor: "rgba(253, 224, 71, 0.45)" }}
            />
            <span className="relative">segundos</span>
            <svg
              aria-hidden="true"
              className="absolute -bottom-2 sm:-bottom-3 left-0 w-full text-ink"
              height="14"
              viewBox="0 0 200 14"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M3 8.5C44 3.2 92 2.4 132 4.1c25 1 47 2.6 65 5.3"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        <p
          className="text-lg sm:text-xl text-body leading-relaxed max-w-2xl mx-auto mt-8 animate-fade-up text-balance"
          style={{ animationDelay: "160ms" }}
        >
          Sube las fotos, escribe el precio y obtén un link único por propiedad.
          Compártelo donde quieras con una preview profesional. Sin portales, sin
          complicaciones.
        </p>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-11 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <Button size="xl" className="h-14 px-8 w-full sm:w-auto" asChild>
            <a href="/register">
              Empezar gratis <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
          <Button
            size="xl"
            variant="secondary"
            className="h-14 px-8 w-full sm:w-auto"
            asChild
          >
            <a href="#how-it-works">Ver cómo funciona</a>
          </Button>
        </div>
        <p
          className="text-sm text-mute mt-6 animate-fade-up"
          style={{ animationDelay: "300ms" }}
        >
          Gratis para siempre · Sin tarjeta de crédito · 100% desde el celular
        </p>
      </div>

      {/* Product mock */}
      <div
        className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 mt-20 lg:mt-28 animate-fade-up"
        style={{ animationDelay: "360ms" }}
      >
        <BrowserMock />
      </div>
    </section>
  );
}
