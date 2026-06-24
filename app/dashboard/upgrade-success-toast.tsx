"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { getIsPremium } from "./actions"

export default function UpgradeSuccessToast() {
  const router = useRouter()
  const [state, setState] = useState<"processing" | "timeout" | "done">(
    "processing",
  )

  useEffect(() => {
    // Clean up query params immediately so a refresh doesn't re-trigger this.
    const url = new URL(window.location.href)
    url.searchParams.delete("upgrade")
    url.searchParams.delete("id")
    url.searchParams.delete("env")
    window.history.replaceState(null, "", url.toString())

    let attempts = 0
    let active = true
    const MAX = 20 // 20 × 1.5s = 30s max

    async function poll() {
      if (!active) return
      attempts++
      const isPremium = await getIsPremium()
      if (isPremium) {
        setState("done")
        router.refresh()
        toast.success("¡Plan Pro activado!", {
          description: "Ya puedes publicar hasta 50 propiedades.",
          duration: 6000,
        })
        return
      }
      if (attempts < MAX) setTimeout(poll, 1500)
      else setState("timeout")
    }

    poll()
    return () => {
      active = false
    }
  }, [router])

  if (state === "done") return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
        {state === "processing" ? (
          <>
            <Loader2
              className="w-8 h-8 animate-spin mx-auto text-ink mb-4"
              strokeWidth={2}
            />
            <h2 className="text-lg font-black text-ink tracking-tighter">
              Confirmando tu pago…
            </h2>
            <p className="text-sm text-body mt-1">
              Esto toma unos segundos. No cierres esta ventana.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-black text-ink tracking-tighter">
              Tu pago se está procesando
            </h2>
            <p className="text-sm text-body mt-1 mb-5">
              Puede tardar un par de minutos. Activaremos tu plan Pro apenas se
              confirme el pago.
            </p>
            <button
              onClick={() => router.refresh()}
              className="w-full h-11 rounded-full bg-ink text-white text-sm font-medium hover:bg-elevated transition-colors"
            >
              Actualizar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
