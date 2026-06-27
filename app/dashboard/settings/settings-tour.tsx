"use client"

import { useEffect } from "react"
import { driver, type DriveStep } from "driver.js"
import "driver.js/dist/driver.css"
import "../tour.css"
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
    let driven = false
    let timer: number | undefined
    let driverObj: ReturnType<typeof driver> | null = null

    const start = () => {
      if (cancelled) return
      driverObj = driver({
        showProgress: true,
        showButtons: ["next", "previous"],
        allowClose: false,
        popoverClass: "conexory-tour",
        overlayColor: "#000",
        overlayOpacity: 0.55,
        nextBtnText: "Siguiente",
        prevBtnText: "Atrás",
        doneBtnText: "Entendido",
        progressText: "{{current}} de {{total}}",
        steps: STEPS,
        onDestroyed: () => {
          if (driven) void completeSettingsTour()
        },
      })
      timer = window.setTimeout(() => {
        driven = true
        driverObj?.drive()
      }, 350)
    }

    void isSettingsTourPending().then((pending) => {
      if (pending) start()
    })

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
      driverObj?.destroy()
    }
  }, [])

  return null
}
