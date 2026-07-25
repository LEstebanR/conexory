"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

const MESSAGES: Record<string, string> = {
  preapproval_failed:
    "No pudimos iniciar la suscripción con Mercado Pago. Intenta de nuevo.",
  cancel_failed:
    "No pudimos cancelar tu suscripción en Mercado Pago. Intenta de nuevo o escríbenos.",
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
