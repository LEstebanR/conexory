"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertTriangle, Loader2 } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { toggleUserIsPremium } from "../actions"

export default function PremiumToggle({
  userId,
  userName,
  initialIsPremium,
}: {
  userId: string
  userName: string
  initialIsPremium: boolean
}) {
  const [isPremium, setIsPremium] = useState(initialIsPremium)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const router = useRouter()

  async function handleConfirm() {
    setConfirmOpen(false)
    setLoading(true)
    try {
      const result = await toggleUserIsPremium(userId, !isPremium)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setIsPremium((p) => !p)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        className="inline-flex items-center justify-center gap-1 w-28 flex-shrink-0 whitespace-nowrap text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-hairline-strong hover:bg-canvas-soft transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isPremium ? (
          "Pro → Free"
        ) : (
          "Free → Pro"
        )}
      </button>

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl shadow-black/10 p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-canvas-soft flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-ink" strokeWidth={2} />
              </div>
              <div>
                <Dialog.Title className="text-base font-black text-ink tracking-tight">
                  {isPremium ? `¿Pasar a ${userName} a Free?` : `¿Pasar a ${userName} a Pro?`}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-body mt-1.5 leading-relaxed">
                  {isPremium
                    ? "Perderá el acceso a los límites y funciones del plan Pro de inmediato."
                    : "Tendrá acceso inmediato a los límites y funciones del plan Pro, sin pasar por Wompi."}
                </Dialog.Description>
              </div>
              <div className="flex gap-2 w-full pt-1">
                <Dialog.Close asChild>
                  <button className="flex-1 h-10 rounded-full border border-hairline-strong text-sm font-semibold text-ink hover:bg-canvas-soft transition-colors">
                    Cancelar
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleConfirm}
                  className="flex-1 h-10 rounded-full bg-ink text-white text-sm font-bold hover:bg-elevated transition-colors"
                >
                  Sí, confirmar
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
