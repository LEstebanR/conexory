"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Hand, Plus, Share2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { completeOnboarding } from "./actions"

const STEPS = [
  { icon: Plus, label: "Crea tu primera propiedad" },
  { icon: Share2, label: "Comparte el link por WhatsApp" },
]

export default function WelcomeBanner({ name }: { name: string }) {
  const [dismissed, setDismissed] = useState(false)
  const [, startTransition] = useTransition()

  if (dismissed) return null

  function handleDismiss() {
    setDismissed(true)
    startTransition(() => {
      void completeOnboarding()
    })
  }

  return (
    <div className="mb-6 rounded-2xl bg-elevated text-white px-5 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex w-9 h-9 rounded-xl bg-white/10 items-center justify-center flex-shrink-0">
            <Hand className="w-4 h-4 text-white" strokeWidth={2} />
          </span>
          <div>
            <p className="text-base font-bold">Bienvenido a Conexory, {name.split(" ")[0]}</p>
            <p className="text-sm text-white/60 mt-0.5">
              Dos pasos para empezar a vender más rápido.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Cerrar"
          className="p-1.5 -m-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2.5 sm:flex-1">
            <span className="inline-flex w-7 h-7 rounded-full bg-white/10 items-center justify-center text-xs font-bold flex-shrink-0">
              {i + 1}
            </span>
            <span className="text-sm font-medium text-white/90">{step.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Button size="sm" variant="secondary" asChild>
          <Link href="/dashboard/properties/new?tour=1">
            <Plus className="w-4 h-4" />
            Crear mi primera propiedad
          </Link>
        </Button>
      </div>
    </div>
  )
}
