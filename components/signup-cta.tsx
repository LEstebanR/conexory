"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignupCTA() {
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
        <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-6">
          Empieza hoy.
          <br />
          <span className="text-brand-950/50">Es gratis.</span>
        </h2>

        <p className="text-xl text-white/70 mb-12 max-w-xl mx-auto leading-relaxed">
          Sin configuración. Sin tutoriales. Crea tu primera propiedad y
          compártela en menos de 60 segundos.
        </p>

        <Button
          size="xl"
          className="h-14 bg-slate-950 text-white hover:bg-slate-900 border-0 font-bold shadow-lg shadow-slate-950/20 px-10"
          asChild
        >
          <Link href="/register">
            Crear cuenta gratis <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>

        <p className="text-white/40 text-sm mt-6">
          Sin tarjeta de crédito · Cancela cuando quieras · Hecho en Colombia 🇨🇴
        </p>
      </div>
    </section>
  )
}
