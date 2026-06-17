import type { Metadata } from "next"
import Link from "next/link"
import { Building2, ArrowLeft, Mail, MessageCircle, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Contacto — Conexory",
  description: "Ponte en contacto con el equipo de Conexory.",
}

export default function ContactoPage() {
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
            Contáctanos
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Estamos aquí para ayudarte
          </h1>
          <p className="text-mute text-base leading-relaxed max-w-xl mx-auto">
            ¿Tienes preguntas, sugerencias o necesitas soporte? Escríbenos y
            te respondemos en menos de 24 horas.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          <a
            href="mailto:hola@conexory.com"
            className="group flex flex-col items-center text-center p-6 rounded-2xl border border-hairline hover:border-ink transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-canvas-soft flex items-center justify-center mb-4 group-hover:bg-surface-pressed transition-colors">
              <Mail className="w-5 h-5 text-ink" />
            </div>
            <p className="font-bold text-ink mb-1">Email general</p>
            <p className="text-sm text-ink font-medium">hola@conexory.com</p>
            <p className="text-xs text-mute mt-2">Para cualquier consulta</p>
          </a>

          <a
            href="mailto:soporte@conexory.com"
            className="group flex flex-col items-center text-center p-6 rounded-2xl border border-hairline hover:border-ink transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-canvas-soft flex items-center justify-center mb-4 group-hover:bg-surface-pressed transition-colors">
              <MessageCircle className="w-5 h-5 text-ink" />
            </div>
            <p className="font-bold text-ink mb-1">Soporte técnico</p>
            <p className="text-sm text-ink font-medium">soporte@conexory.com</p>
            <p className="text-xs text-mute mt-2">Problemas con la plataforma</p>
          </a>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-hairline">
            <div className="w-12 h-12 rounded-2xl bg-canvas-soft flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-body" />
            </div>
            <p className="font-bold text-ink mb-1">Ubicación</p>
            <p className="text-sm text-body font-medium">Bogotá D.C.</p>
            <p className="text-xs text-mute mt-2">Colombia</p>
          </div>
        </div>

        <div className="bg-canvas-softer rounded-2xl border border-hairline p-8">
          <h2 className="text-lg font-black text-ink tracking-tight mb-2">
            Preguntas frecuentes
          </h2>
          <p className="text-sm text-body mb-6">
            Antes de escribirnos, revisa si tu pregunta ya tiene respuesta aquí.
          </p>
          <div className="space-y-5">
            {[
              {
                q: "¿Es gratis Conexory?",
                a: "Sí, puedes empezar gratis con todas las funciones básicas. En el futuro habrá planes Pro con funcionalidades adicionales.",
              },
              {
                q: "¿Necesito instalar algo?",
                a: "No. Conexory funciona completamente desde el navegador, en cualquier dispositivo.",
              },
              {
                q: "¿Cómo elimino mi cuenta?",
                a: "Escríbenos a soporte@conexory.com y procesamos la eliminación en menos de 24 horas.",
              },
              {
                q: "¿Dónde se almacenan mis datos?",
                a: "En servidores en Estados Unidos (Vercel y Neon), con los más altos estándares de seguridad. Más detalles en nuestra Política de Privacidad.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-hairline-strong pb-5 last:border-0 last:pb-0">
                <p className="font-semibold text-ink mb-1 text-sm">{q}</p>
                <p className="text-sm text-body">{a}</p>
              </div>
            ))}
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
