"use client"

import { useEffect } from "react"
import { toast } from "sonner"

// Reads the flag from window.location instead of useSearchParams so the
// landing stays statically rendered.
export default function AccountDeletedToast() {
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("cuenta") !== "eliminada") return

    toast.success("Tu cuenta fue eliminada. Gracias por usar Conexory.")
    url.searchParams.delete("cuenta")
    window.history.replaceState(null, "", url.pathname + url.search + url.hash)
  }, [])

  return null
}
