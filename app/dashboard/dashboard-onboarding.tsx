"use client"

import { useEffect, useState } from "react"
import { driver, type DriveStep } from "driver.js"
import "driver.js/dist/driver.css"
import "./tour.css"
import WelcomeModal from "./welcome-modal"
import { completeDashboardTour } from "./actions"

function sidebarSteps(isMobile: boolean): DriveStep[] {
  const suffix = isMobile ? "-mobile" : ""
  const side = isMobile ? "bottom" : "right"
  return [
    {
      element: `#tour-properties${suffix}`,
      popover: {
        title: "Mis propiedades",
        description:
          "Tu panel principal. Aquí ves todas tus propiedades, cuántas veces se compartieron y gestionas cada una.",
        side,
        align: "start",
      },
    },
    {
      element: `#tour-settings${suffix}`,
      popover: {
        title: "Configuración",
        description:
          "Edita tu perfil de agente, tus datos de contacto y las preferencias de tu cuenta.",
        side: isMobile ? "top" : side,
        align: "start",
      },
    },
  ]
}

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

    // Both steps live in the mobile drawer, so it stays open for the whole tour.
    const isMobile = !window.matchMedia("(min-width: 1024px)").matches

    // Only persist once the tour actually started, so React strict mode's
    // mount/unmount/mount doesn't mark it done before the user saw it.
    let driven = false
    const driverObj = driver({
      showProgress: true,
      popoverClass: "conexory-tour",
      overlayColor: "#000",
      overlayOpacity: 0.6,
      nextBtnText: "Siguiente",
      prevBtnText: "Atrás",
      doneBtnText: "Entendido",
      progressText: "{{current}} de {{total}}",
      disableActiveInteraction: true,
      steps: sidebarSteps(isMobile),
      onDestroyed: () => {
        if (isMobile) toggleSidebar(false)
        if (driven) void completeDashboardTour()
      },
    })

    if (isMobile) toggleSidebar(true)
    const timer = window.setTimeout(() => {
      driven = true
      driverObj.drive()
    }, isMobile ? 400 : 300)

    return () => {
      window.clearTimeout(timer)
      // destroy() is a no-op before drive(), so onDestroyed won't close the drawer.
      if (isMobile && !driven) toggleSidebar(false)
      driverObj.destroy()
    }
  }, [modalDone, dashboardTourCompleted])

  if (!welcomeModalSeen) {
    return <WelcomeModal name={name} onClosed={() => setModalDone(true)} />
  }

  return null
}
