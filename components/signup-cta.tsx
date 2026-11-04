import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignupCTA() {
  return (
    <section id="empezar" className="bg-ink">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 py-28 text-center">
        <h2 className="font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none mb-6">
          Tu próxima captación,
          <br />
          <span className="text-mute">lista para WhatsApp hoy.</span>
        </h2>

        <p className="text-xl text-white/80 mb-12 max-w-xl mx-auto leading-relaxed">
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
            Crear cuenta gratis
          </Link>
        </Button>

        <p className="text-mute text-sm mt-6">
          Sin tarjeta de crédito · Cancela cuando quieras · Hecho en Colombia
        </p>
      </div>
    </section>
  )
}
