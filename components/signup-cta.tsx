"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function SignupCTA() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section id="empezar" className="relative overflow-hidden bg-brand-400">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-300/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-500/40 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
        {/* Headline */}
        <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-6">
          Empieza hoy.
          <br />
          <span className="text-brand-950/50">Es gratis.</span>
        </h2>

        <p className="text-xl text-white/70 mb-12 max-w-xl mx-auto leading-relaxed">
          Sin configuración. Sin tutoriales. Crea tu primera propiedad y
          compártela en menos de 60 segundos.
        </p>

        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-14 text-base bg-white border-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-white/50 focus:border-white"
            />
            <Button
              type="submit"
              size="xl"
              className="h-14 bg-slate-950 text-white hover:bg-slate-900 border-0 font-bold shadow-lg shadow-slate-950/20 shrink-0"
            >
              Crear cuenta <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-3 bg-white/20 rounded-2xl px-8 py-5 max-w-sm mx-auto">
            <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
            <p className="text-white font-bold text-lg">
              ¡Listo! Bienvenido a MiAgente 🏠
            </p>
          </div>
        )}

        <p className="text-white/40 text-sm mt-5">
          Sin tarjeta de crédito · Cancela cuando quieras · Hecho en Colombia 🇨🇴
        </p>
      </div>
    </section>
  )
}
