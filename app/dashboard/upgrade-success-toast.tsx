"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getIsPremium } from "./actions"

export default function UpgradeSuccessToast() {
  const router = useRouter()

  useEffect(() => {
    // Clean up query params immediately
    const url = new URL(window.location.href)
    url.searchParams.delete("upgrade")
    url.searchParams.delete("id")
    url.searchParams.delete("env")
    window.history.replaceState(null, "", url.toString())

    // Poll until the webhook sets isPremium=true in the DB, then refresh so
    // the layout and all server components pick up the new plan.
    let attempts = 0
    const MAX = 20 // 20 × 1.5s = 30s max

    async function poll() {
      attempts++
      const isPremium = await getIsPremium()
      if (isPremium) {
        router.refresh()
        toast.success("¡Plan Pro activado!", {
          description: "Ya puedes publicar hasta 50 propiedades.",
          duration: 6000,
        })
        return
      }
      if (attempts < MAX) setTimeout(poll, 1500)
    }

    poll()
  }, [router])

  return null
}
