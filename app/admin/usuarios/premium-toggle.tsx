"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AlertTriangle, CalendarClock, Loader2 } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { toggleUserIsPremium } from "../actions"

function tomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Bogota",
  })
}

export default function PremiumToggle({
  userId,
  userName,
  initialIsPremium,
  initialPremiumUntil,
}: {
  userId: string
  userName: string
  initialIsPremium: boolean
  initialPremiumUntil?: string | null
}) {
  const [isPremium, setIsPremium] = useState(initialIsPremium)
  const [premiumUntil, setPremiumUntil] = useState(initialPremiumUntil ?? null)
  const [dateInput, setDateInput] = useState(tomorrowISO)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const router = useRouter()

  async function handleConfirm() {
    if (!isPremium && !dateInput) {
      toast.error("Elige una fecha de expiración.")
      return
    }
    setConfirmOpen(false)
    setLoading(true)
    try {
      const result = await toggleUserIsPremium(
        userId,
        !isPremium,
        !isPremium ? dateInput : null
      )
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setIsPremium((p) => !p)
      setPremiumUntil(!isPremium ? dateInput : null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const activating = !isPremium

  return (
    <>
      <div className="flex flex-col items-end gap-1">
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
        {isPremium && premiumUntil && (
          <span className="inline-flex items-center gap-1 text-[10px] text-mute font-medium whitespace-nowrap">
            <CalendarClock className="w-3 h-3" />
            hasta {formatDate(premiumUntil)}
          </span>
        )}
      </div>

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl shadow-black/10 p-6 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-canvas-soft flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-ink" strokeWidth={2} />
              </div>
              <div className="w-full">
                <Dialog.Title className="text-base font-black text-ink tracking-tight">
                  {activating ? `¿Pasar a ${userName} a Pro?` : `¿Pasar a ${userName} a Free?`}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-body mt-1.5 leading-relaxed">
                  {activating
                    ? "Tendrá acceso inmediato a los límites y funciones del plan Pro, sin pasar por Wompi."
                    : "Perderá el acceso a los límites y funciones del plan Pro de inmediato."}
                </Dialog.Description>
                {activating && (
                  <div className="mt-4 text-left">
                    <label
                      htmlFor="premium-until"
                      className="block text-xs font-bold text-ink mb-1.5"
                    >
                      Activo hasta
                    </label>
                    <input
                      id="premium-until"
                      type="date"
                      value={dateInput}
                      min={tomorrowISO()}
                      onChange={(e) => setDateInput(e.target.value)}
                      required
                      className="w-full h-10 px-3 rounded-xl border border-hairline-strong text-sm focus:outline-none focus:ring-2 focus:ring-ink"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 w-full pt-1">
                <Dialog.Close asChild>
                  <Button variant="secondary" className="flex-1">
                    Cancelar
                  </Button>
                </Dialog.Close>
                <Button variant="default" className="flex-1" onClick={handleConfirm}>
                  Sí, confirmar
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
