import Image from "next/image";
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
        className="hidden lg:flex absolute -top-5 -left-6 bg-white rounded-full shadow-xl border border-hairline px-4 py-2.5 items-center z-10 animate-fade-up"
        style={{ animationDelay: "500ms" }}
      >
        <span className="text-xs font-bold text-ink">Link copiado</span>
      </div>

      {/* Floating: shares count */}
      <div
        className="hidden lg:flex absolute -bottom-5 -right-6 bg-white rounded-full shadow-xl border border-hairline px-4 py-2.5 items-center z-10 animate-fade-up"
        style={{ animationDelay: "650ms" }}
      >
        <span className="text-xs font-bold text-ink">+3 interesados hoy</span>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="pt-28 pb-20 lg:pt-36 lg:pb-28 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 grid lg:grid-cols-[1.2fr_0.8fr] gap-16 lg:gap-12 items-center">
        <div>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-ink animate-fade-up text-balance"
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
            className="text-lg sm:text-xl text-body leading-relaxed max-w-xl mt-8 animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            Sube las fotos, escribe el precio y obtén un link único por propiedad.
            Compártelo donde quieras con una preview profesional. Sin portales, sin
            complicaciones.
          </p>

          <div
            className="mt-10 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <Button size="xl" className="h-14 px-8 w-full sm:w-auto" asChild>
              <a href="/register">Crear cuenta gratis</a>
            </Button>
          </div>
          <p
            className="text-sm text-mute mt-5 animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            Gratis para siempre · Sin tarjeta de crédito · 100% desde el celular
          </p>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "360ms" }}>
          <BrowserMock />
        </div>
      </div>
    </section>
  );
}
