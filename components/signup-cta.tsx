"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignupCTA() {
  return (
    <section id="empezar" className="relative overflow-hidden bg-ink">
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
        <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-6">
          Empieza hoy.
          <br />
          <span className="text-mute">Es gratis.</span>
        </h2>

        <p className="text-xl text-white/60 mb-12 max-w-xl mx-auto leading-relaxed">
          Sin configuración. Sin tutoriales. Crea tu primera propiedad y
          compártela en menos de 60 segundos.
        </p>

        <Button
          size="xl"
          variant="secondary"
          className="h-14 px-10 border-0"
          asChild
        >
          <Link href="/register">
            Crear cuenta gratis <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>

        <p className="text-mute text-sm mt-6">
          Sin tarjeta de crédito · Cancela cuando quieras · Hecho en Colombia 🇨🇴
        </p>
      </div>
    </section>
  )
}
