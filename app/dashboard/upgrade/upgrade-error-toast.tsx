"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

const MESSAGES: Record<string, string> = {
  card: "No pudimos registrar tu método de pago. Verifica los datos e intenta de nuevo.",
  source_failed:
    "No pudimos registrar tu método de pago. Verifica los datos e intenta de nuevo.",
  pending:
    "Tu método de pago quedó pendiente de confirmación. Intenta de nuevo.",
  charge: "No pudimos procesar el primer cobro. Intenta más tarde.",
  charge_failed: "No pudimos procesar el primer cobro. Intenta más tarde.",
}

export function UpgradeErrorToast() {
  const params = useSearchParams()
  const error = params.get("error")

  useEffect(() => {
    if (!error) return
    toast.error(MESSAGES[error] ?? "No pudimos completar la suscripción.")

    const url = new URL(window.location.href)
    url.searchParams.delete("error")
    window.history.replaceState(null, "", url.toString())
  }, [error])

  return null
}
