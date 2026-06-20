import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { cancelSubscription } from "./actions"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cancelar suscripción — Conexory",
}

const LOSSES = [
  "Tu límite vuelve a 3 propiedades activas",
  "Las propiedades que superen ese límite se desactivarán",
  "Solo podrás subir hasta 10 fotos por propiedad",
]

export default async function CancelPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  if (!session.user.isPremium) redirect("/dashboard")

  return (
    <div className="flex-1 flex items-start justify-center p-6 lg:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-warning-100 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning-600" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-black text-ink tracking-tighter">
            ¿Cancelar el plan Pro?
          </h1>
          <p className="text-sm text-body mt-1">
            Esta acción es inmediata y no tiene reembolso.
          </p>
        </div>

        <div className="rounded-3xl border border-warning-200 bg-warning-50 p-7 mb-4">
          <p className="text-sm font-bold text-warning-900 mb-4">Al cancelar perderás acceso a:</p>
          <ul className="space-y-3">
            {LOSSES.map((l) => (
              <li key={l} className="flex items-start gap-2.5 text-sm text-warning-800">
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-warning-500 flex-shrink-0" />
                {l}
              </li>
            ))}
          </ul>
        </div>

        <form action={cancelSubscription}>
          <Button variant="destructive" size="lg" className="w-full mb-3">
            Sí, cancelar mi suscripción
          </Button>
        </form>

        <Button variant="secondary" size="lg" className="w-full" asChild>
          <Link href="/dashboard/upgrade">Mantener Pro</Link>
        </Button>
      </div>
    </div>
  )
}
