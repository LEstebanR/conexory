"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export default function UpgradeSuccessToast() {
  useEffect(() => {
    toast.success("¡Plan Pro activado!", {
      description: "Ya puedes publicar hasta 50 propiedades.",
      duration: 6000,
    })
    // Remove the query param from the URL without a full navigation
    const url = new URL(window.location.href)
    url.searchParams.delete("upgrade")
    window.history.replaceState(null, "", url.toString())
  }, [])

  return null
}
