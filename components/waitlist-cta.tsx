"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function WaitlistCTA() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
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
        body: JSON.stringify({ email, name }),
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
    <section
      id="waitlist"
      className="py-28 bg-slate-950 relative overflow-hidden"
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-brand-400/10 blur-3xl" />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-brand-400/8 blur-3xl" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#41b883 1px, transparent 1px), linear-gradient(90deg, #41b883 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Pulse badge */}
        <div className="inline-flex items-center gap-2.5 bg-brand-400/15 border border-brand-400/25 rounded-full px-5 py-2.5 mb-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400" />
          </span>
          <span className="text-sm font-semibold text-brand-300">
            Waitlist abierto — acceso anticipado
          </span>
        </div>

        <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
          ¿Listo para
          <br />
          <span className="text-brand-400">vender más?</span>
        </h2>
        <p className="text-xl text-slate-400 mb-12 leading-relaxed">
          Únete al waitlist hoy y obtén{" "}
          <span className="text-white font-semibold">
            3 meses gratis + 50% de descuento
          </span>{" "}
          de por vida cuando lancemos.
        </p>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Tu nombre (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base bg-white/8 border-white/15 text-white placeholder:text-slate-500 focus:ring-brand-400 focus:border-brand-400 focus:bg-white/12"
            />
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-base bg-white/8 border-white/15 text-white placeholder:text-slate-500 focus:ring-brand-400 focus:border-brand-400 focus:bg-white/12"
            />
            <Button
              type="submit"
              size="xl"
              disabled={loading}
              className="w-full h-14 text-base font-bold shadow-lg shadow-brand-400/20"
            >
              {loading ? (
                "Un momento..."
              ) : (
                <>
                  Asegurar mi lugar gratuito{" "}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <p className="text-xs text-slate-600">
              Sin spam · Sin tarjeta de crédito · Solo pura felicidad inmobiliaria 🏠
            </p>
          </form>
        ) : (
          <div className="bg-brand-400/15 border border-brand-400/30 rounded-2xl p-10 max-w-md mx-auto">
            <CheckCircle2 className="w-14 h-14 text-brand-400 mx-auto mb-5" />
            <h3 className="text-2xl font-bold text-white mb-3">
              ¡Estás dentro! 🎉
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Hemos guardado tu lugar. Te avisaremos antes que nadie cuando
              lancemos.{" "}
              <span className="text-brand-300 font-medium">{email}</span>
            </p>
          </div>
        )}

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-14">
          {[
            "🔒 Datos protegidos",
            "📧 Sin spam",
            "💳 Sin tarjeta",
            "🇨🇴 Hecho en Colombia",
          ].map((badge) => (
            <span key={badge} className="text-sm text-slate-600">
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
