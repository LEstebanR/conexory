"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import confetti from "canvas-confetti"
import { ArrowRight, Sparkles } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { Button } from "@/components/ui/button"
import { markWelcomeModalSeen } from "./actions"

const CONFETTI_COLORS = ["#000000", "#282828", "#5e5e5e", "#afafaf", "#ffffff"]

function fireConfetti() {
  const end = Date.now() + 900
  const defaults = {
    colors: CONFETTI_COLORS,
    disableForReducedMotion: true,
    zIndex: 100,
  }

  confetti({
    ...defaults,
    particleCount: 90,
    spread: 80,
    startVelocity: 45,
    origin: { y: 0.35 },
  })

  const frame = () => {
    confetti({ ...defaults, particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } })
    confetti({ ...defaults, particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

export default function WelcomeModal({
  name,
  onClosed,
}: {
  name: string
  onClosed?: () => void
}) {
  const [open, setOpen] = useState(true)
  const [, startTransition] = useTransition()
  const completed = useRef(false)
  const firstName = name.split(" ")[0]

  useEffect(() => {
    const timer = window.setTimeout(fireConfetti, 250)
    return () => window.clearTimeout(timer)
  }, [])

  function markCompleted() {
    if (completed.current) return
    completed.current = true
    startTransition(() => {
      void markWelcomeModalSeen()
    })
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      markCompleted()
      onClosed?.()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed z-50 inset-0 flex flex-col items-center justify-center sm:block sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[calc(100%-2rem)] sm:max-w-md bg-white rounded-none sm:rounded-2xl shadow-2xl shadow-black/10 p-7 sm:p-8 animate-fade-in sm:animate-fade-up text-center">
          <div className="flex flex-col items-center">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-ink items-center justify-center mb-5">
              <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
            </span>

            <Dialog.Title className="text-2xl font-black text-ink tracking-tight text-balance">
              ¡Bienvenido a Conexory, {firstName}!
            </Dialog.Title>

            <Dialog.Description className="text-sm text-body mt-3 leading-relaxed text-balance max-w-sm">
              Tu cuenta ya está lista. Aquí vas a crear fichas de tus propiedades,
              obtener un link único y compartirlas por WhatsApp con una vista previa
              que vende sola — todo en menos de 60 segundos.
            </Dialog.Description>

            <div className="mt-7 w-full">
              <Dialog.Close asChild>
                <Button size="lg" className="w-full" onClick={markCompleted}>
                  Ver tour inicial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
