"use client"

import { useEffect } from "react"
import { runTour, NON_CLOSEABLE, type DriveStep } from "@/lib/tour"
import { isSettingsTourPending, completeSettingsTour } from "./actions"

const STEPS: DriveStep[] = [
  {
    element: "#tour-settings-profile",
    popover: {
      title: "Tu información de agente",
      description:
        "Completa tu foto, nombre, contacto y redes. Mostrarla en tus propiedades es opcional: en cada una decides si aparece, y cuando la activas genera más confianza. Puedes llenarlo ahora o seguir y hacerlo después.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-settings-public",
    popover: {
      title: "Perfil público (opcional)",
      description:
        "Activar tu perfil público es totalmente opcional. Si lo activas, obtienes un link que reúne todas tus propiedades en un solo lugar para compartir. Si no, igual puedes compartir cada propiedad por separado.",
      side: "left",
      align: "start",
    },
  },
]

export default function SettingsTour() {
  useEffect(() => {
    let cancelled = false
    let cleanup: (() => void) | null = null

    void isSettingsTourPending().then((pending) => {
      if (pending && !cancelled) {
        cleanup = runTour(STEPS, {
          onComplete: () => void completeSettingsTour(),
          config: NON_CLOSEABLE,
        })
      }
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return null
}
