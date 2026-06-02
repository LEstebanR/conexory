import type { Metadata } from "next"
import Link from "next/link"
import { Building2, ArrowLeft, Mail, MessageCircle, MapPin } from "lucide-react"

export const metadata: Metadata = {
  title: "Contacto — MiAgente",
  description: "Ponte en contacto con el equipo de MiAgente.",
}

export default function ContactoPage() {
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
            Contáctanos
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Estamos aquí para ayudarte
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xl mx-auto">
            ¿Tienes preguntas, sugerencias o necesitas soporte? Escríbenos y
            te respondemos en menos de 24 horas.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          <a
            href="mailto:hola@miagente.co"
            className="group flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
              <Mail className="w-5 h-5 text-brand-500" />
            </div>
            <p className="font-bold text-slate-900 mb-1">Email general</p>
            <p className="text-sm text-brand-500 font-medium">hola@miagente.co</p>
            <p className="text-xs text-slate-400 mt-2">Para cualquier consulta</p>
          </a>

          <a
            href="mailto:soporte@miagente.co"
            className="group flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="font-bold text-slate-900 mb-1">Soporte técnico</p>
            <p className="text-sm text-blue-500 font-medium">soporte@miagente.co</p>
            <p className="text-xs text-slate-400 mt-2">Problemas con la plataforma</p>
          </a>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <MapPin className="w-5 h-5 text-slate-500" />
            </div>
            <p className="font-bold text-slate-900 mb-1">Ubicación</p>
            <p className="text-sm text-slate-600 font-medium">Bogotá D.C.</p>
            <p className="text-xs text-slate-400 mt-2">Colombia 🇨🇴</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8">
          <h2 className="text-lg font-black text-slate-950 tracking-tight mb-2">
            Preguntas frecuentes
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Antes de escribirnos, revisa si tu pregunta ya tiene respuesta aquí.
          </p>
          <div className="space-y-5">
            {[
              {
                q: "¿Es gratis MiAgente?",
                a: "Sí, puedes empezar gratis con todas las funciones básicas. En el futuro habrá planes Pro con funcionalidades adicionales.",
              },
              {
                q: "¿Necesito instalar algo?",
                a: "No. MiAgente funciona completamente desde el navegador, en cualquier dispositivo.",
              },
              {
                q: "¿Cómo elimino mi cuenta?",
                a: "Escríbenos a soporte@miagente.co y procesamos la eliminación en menos de 24 horas.",
              },
              {
                q: "¿Dónde se almacenan mis datos?",
                a: "En servidores en Estados Unidos (Vercel y Neon), con los más altos estándares de seguridad. Más detalles en nuestra Política de Privacidad.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0">
                <p className="font-semibold text-slate-900 mb-1 text-sm">{q}</p>
                <p className="text-sm text-slate-500">{a}</p>
              </div>
            ))}
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
