"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

const STEPS = [
  {
    element: "#tour-type",
    popover: {
      title: "1. Elige el tipo",
      description:
        "Selecciona qué tipo de inmueble es y si lo vendes o arriendas. Es lo primero que verá tu cliente.",
    },
  },
  {
    element: "#tour-photos",
    popover: {
      title: "2. Sube fotos",
      description:
        "Las fotos son lo que más vende. Arrastra varias y ordénalas; la primera será la portada del link.",
    },
  },
  {
    element: "#tour-basic",
    popover: {
      title: "3. Datos básicos",
      description:
        "Título, precio y ubicación. Con esto basta para tener una ficha lista para compartir.",
    },
  },
  {
    element: "#tour-submit",
    popover: {
      title: "4. Publica y comparte",
      description:
        "Al publicar obtienes un link único para enviar por WhatsApp con una vista previa profesional.",
    },
  },
]

export default function PropertyTour() {
  const searchParams = useSearchParams()
  const shouldStart = searchParams.get("tour") === "1"

  useEffect(() => {
    if (!shouldStart) return

    const url = new URL(window.location.href)
    url.searchParams.delete("tour")
    window.history.replaceState(null, "", url.toString())

    const driverObj = driver({
      showProgress: true,
      nextBtnText: "Siguiente",
      prevBtnText: "Atrás",
      doneBtnText: "Entendido",
      progressText: "{{current}} de {{total}}",
      steps: STEPS,
    })

    const timer = window.setTimeout(() => driverObj.drive(), 350)

    return () => {
      window.clearTimeout(timer)
      driverObj.destroy()
    }
  }, [shouldStart])

  return null
}
