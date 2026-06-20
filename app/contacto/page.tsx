import type { Metadata } from "next"
import { Mail, MessageCircle, MapPin } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Reveal from "@/components/reveal"

export const metadata: Metadata = {
  title: "Contacto — Conexory",
  description: "Ponte en contacto con el equipo de Conexory.",
}

const channels = [
  { icon: Mail, title: "Email general", value: "Conexory@gmail.com", note: "Para cualquier consulta", href: "mailto:Conexory@gmail.com" },
  { icon: MessageCircle, title: "Soporte técnico", value: "Conexory@gmail.com", note: "Problemas con la plataforma", href: "mailto:Conexory@gmail.com" },
  { icon: MapPin, title: "Ubicación", value: "Bogotá D.C.", note: "Colombia", href: null },
]

const faqs = [
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
    a: "Escríbenos a Conexory@gmail.com y procesamos la eliminación en menos de 24 horas.",
  },
  {
    q: "¿Dónde se almacenan mis datos?",
    a: "En servidores en Estados Unidos (Vercel y Neon), con los más altos estándares de seguridad. Más detalles en nuestra Política de Privacidad.",
  },
]

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 text-center">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
          <p className="text-body font-semibold text-sm uppercase tracking-[0.2em] mb-5 animate-fade-up">
            Contacto
          </p>
          <h1
            className="text-4xl sm:text-6xl font-black text-ink tracking-tighter leading-[1.05] animate-fade-up text-balance"
            style={{ animationDelay: "80ms" }}
          >
            Estamos aquí
            <br />
            <span className="text-mute">para ayudarte.</span>
          </h1>
          <p
            className="text-lg text-body leading-relaxed mt-6 max-w-xl mx-auto animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            ¿Tienes preguntas, sugerencias o necesitas soporte? Escríbenos y te
            respondemos en menos de 24 horas.
          </p>
        </div>
      </section>

      {/* Channels */}
      <section className="max-w-5xl mx-auto w-full px-5 sm:px-6 lg:px-8 pb-16">
        <div className="grid sm:grid-cols-3 gap-5">
          {channels.map((c, i) => {
            const inner = (
              <>
                <div className="w-12 h-12 rounded-2xl bg-canvas-soft flex items-center justify-center mb-5 group-hover:bg-ink transition-colors">
                  <c.icon className="w-5 h-5 text-ink group-hover:text-white transition-colors" />
                </div>
                <p className="font-bold text-ink mb-1">{c.title}</p>
                <p className="text-sm text-ink font-medium">{c.value}</p>
                <p className="text-xs text-mute mt-2">{c.note}</p>
              </>
            )
            return (
              <Reveal key={c.title} delay={i * 80}>
                {c.href ? (
                  <a
                    href={c.href}
                    className="group flex flex-col h-full p-6 rounded-2xl border border-hairline hover:border-ink transition-colors"
                  >
                    {inner}
                  </a>
                ) : (
                  <div className="flex flex-col h-full p-6 rounded-2xl border border-hairline">
                    {inner}
                  </div>
                )}
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto w-full px-5 sm:px-6 lg:px-8 pb-24">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-black text-ink tracking-tighter mb-8">
            Preguntas frecuentes
          </h2>
        </Reveal>
        <div className="divide-y divide-hairline border-t border-hairline">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <div className="py-6">
                <p className="font-bold text-ink mb-2">{f.q}</p>
                <p className="text-sm text-body leading-relaxed">{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
