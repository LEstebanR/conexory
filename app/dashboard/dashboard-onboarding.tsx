"use client"

import { useEffect, useState } from "react"
import { driver, type Config, type DriveStep } from "driver.js"
import { TOUR_BASE_CONFIG, NON_CLOSEABLE } from "@/lib/tour"
import WelcomeModal from "./welcome-modal"
import { completeDashboardTour } from "./actions"

const CREATE_STEP: DriveStep = {
  element: "#tour-new-property",
  popover: {
    title: "Crea tus propiedades",
    description:
      "Desde aquí publicas una nueva propiedad: subes fotos, pones el precio y obtienes tu link en menos de un minuto.",
    side: "bottom",
    align: "end",
  },
}

const DESKTOP_STEPS: DriveStep[] = [
  CREATE_STEP,
  {
    element: "#tour-properties",
    popover: {
      title: "Mis propiedades",
      description:
        "Tu panel principal. Aquí ves todas tus propiedades, cuántas veces se compartieron y gestionas cada una.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "#tour-settings",
    popover: {
      title: "Configuración",
      description:
        "Edita tu perfil de agente, tus datos de contacto y las preferencias de tu cuenta.",
      side: "right",
      align: "start",
    },
  },
]

const MOBILE_STEPS: DriveStep[] = [
  CREATE_STEP,
  {
    element: "#tour-properties-mobile",
    popover: {
      title: "Mis propiedades",
      description:
        "Tu panel principal. Aquí ves todas tus propiedades, cuántas veces se compartieron y gestionas cada una.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "#tour-settings-mobile",
    popover: {
      title: "Configuración",
      description:
        "Edita tu perfil de agente, tus datos de contacto y las preferencias de tu cuenta.",
      side: "top",
      align: "start",
    },
  },
]

function toggleSidebar(open: boolean) {
  window.dispatchEvent(new CustomEvent("conexory:toggle-sidebar", { detail: open }))
}

export default function DashboardOnboarding({
  name,
  welcomeModalSeen,
  dashboardTourCompleted,
}: {
  name: string
  welcomeModalSeen: boolean
  dashboardTourCompleted: boolean
}) {
  const [modalDone, setModalDone] = useState(welcomeModalSeen)

  useEffect(() => {
    if (!modalDone || dashboardTourCompleted) return

    const isMobile = !window.matchMedia("(min-width: 1024px)").matches
    const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS

    let driven = false
    let completed = false
    const persist = () => {
      if (completed || !driven) return
      completed = true
      void completeDashboardTour()
    }

    // Track the drawer-choreography timeouts so they can't fire moveNext on a
    // destroyed driver (and leave the drawer open) after unmount.
    const navTimers: number[] = []

    const config: Config = {
      ...TOUR_BASE_CONFIG,
      ...NON_CLOSEABLE,
      disableActiveInteraction: true,
      steps,
      onDestroyed: () => {
        if (isMobile) toggleSidebar(false)
        persist()
      },
    }

    if (isMobile) {
      // The mobile nav lives in a drawer, so open it for the nav steps and
      // close it when stepping back to the header.
      config.onNextClick = (_el, _step, { driver: d }) => {
        const i = d.getActiveIndex() ?? 0
        if (i >= steps.length - 1) {
          d.destroy()
          return
        }
        if (i === 0) {
          toggleSidebar(true)
          navTimers.push(window.setTimeout(() => d.moveNext(), 300))
        } else {
          d.moveNext()
        }
      }
      config.onPrevClick = (_el, _step, { driver: d }) => {
        const i = d.getActiveIndex() ?? 0
        if (i === 1) {
          toggleSidebar(false)
          navTimers.push(window.setTimeout(() => d.movePrevious(), 300))
        } else {
          d.movePrevious()
        }
      }
    }

    const driverObj = driver(config)

    const timer = window.setTimeout(() => {
      driven = true
      driverObj.drive()
    }, 400)

    return () => {
      window.clearTimeout(timer)
      navTimers.forEach((t) => window.clearTimeout(t))
      driverObj.destroy()
    }
  }, [modalDone, dashboardTourCompleted])

  if (!welcomeModalSeen) {
    return <WelcomeModal name={name} onClosed={() => setModalDone(true)} />
  }

  return null
}
