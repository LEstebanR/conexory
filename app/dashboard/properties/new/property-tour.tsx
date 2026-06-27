"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { driver, type DriveStep } from "driver.js"
import "driver.js/dist/driver.css"
import "../../tour.css"
import { isPropertyTourPending, completePropertyTour } from "./actions"

const STEPS: DriveStep[] = [
  {
    element: "#tour-type",
    popover: {
      title: "Tipo de propiedad",
      description:
        "Elige qué tipo de inmueble es: apartamento, casa, oficina, lote… Define cómo se presenta tu propiedad.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-transaction",
    popover: {
      title: "Tipo de operación",
      description:
        "Indica cómo se ofrece la propiedad: venta, arriendo, arriendo amoblado o permuta.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-photos",
    popover: {
      title: "Fotos y video",
      description:
        "Sube varias fotos (la primera es la portada) y, si quieres, un video de YouTube. Las fotos son lo que más vende.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-basic",
    popover: {
      title: "Información básica",
      description:
        "El título, el precio y la ubicación. Es la información esencial que verá tu cliente.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-details",
    popover: {
      title: "Detalles",
      description:
        "Área, habitaciones, baños y parqueaderos. Son opcionales, pero dan más confianza a quien te contacta.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-description",
    popover: {
      title: "Descripción",
      description:
        "Cuenta lo que las fotos no dicen: acabados, alrededores y puntos de interés cercanos.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-map",
    popover: {
      title: "Ubicación en mapa",
      description:
        "Opcional: marca el punto exacto para mostrarlo en la ficha pública de la propiedad.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-contact",
    popover: {
      title: "Datos de contacto",
      description:
        "Decide si tu nombre, teléfono y correo aparecen al final del link público.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-submit",
    popover: {
      title: "Publica y comparte",
      description:
        "Cuando termines, publica y obtén tu link único para compartir por WhatsApp con una vista previa profesional.",
      side: "bottom",
      align: "start",
    },
  },
]

export default function PropertyTour() {
  const searchParams = useSearchParams()
  const forced = searchParams.get("tour") === "1"

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
          if (driven) void completePropertyTour()
        },
      })
      timer = window.setTimeout(() => {
        driven = true
        driverObj?.drive()
      }, 350)
    }

    if (forced) {
      const url = new URL(window.location.href)
      url.searchParams.delete("tour")
      window.history.replaceState(null, "", url.toString())
      start()
    } else {
      void isPropertyTourPending().then((pending) => {
        if (pending) start()
      })
    }

    // Publishing the property ends the tour (and persists it via onDestroyed).
    const finish = () => driverObj?.destroy()
    window.addEventListener("conexory:finish-property-tour", finish)

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
      window.removeEventListener("conexory:finish-property-tour", finish)
      driverObj?.destroy()
    }
  }, [forced])

  return null
}
