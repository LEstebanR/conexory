import { driver, type Config, type DriveStep } from "driver.js"
import "driver.js/dist/driver.css"
import "@/app/dashboard/tour.css"

export type { DriveStep }

// Shared driver.js theme/copy for every Conexory guided tour.
export const TOUR_BASE_CONFIG: Config = {
  showProgress: true,
  popoverClass: "conexory-tour",
  overlayColor: "#000",
  overlayOpacity: 0.6,
  nextBtnText: "Siguiente",
  prevBtnText: "Atrás",
  doneBtnText: "Entendido",
  progressText: "{{current}} de {{total}}",
}

// Can't close (no overlay/Esc close, no X button); only advances to "Entendido".
export const NON_CLOSEABLE: Partial<Config> = {
  showButtons: ["next", "previous"],
  allowClose: false,
}

// Runs a simple (no per-step navigation choreography) tour and returns a cleanup
// function. `onComplete` fires only if the tour actually started driving — this
// guards against React strict-mode's mount/unmount/mount double-invoke marking
// the tour done before the user ever saw it.
export function runTour(
  steps: DriveStep[],
  opts: { onComplete: () => void; config?: Partial<Config> },
): () => void {
  let driven = false
  const driverObj = driver({
    ...TOUR_BASE_CONFIG,
    ...opts.config,
    steps,
    onDestroyed: () => {
      if (driven) opts.onComplete()
    },
  })
  const timer = window.setTimeout(() => {
    driven = true
    driverObj.drive()
  }, 350)
  return () => {
    window.clearTimeout(timer)
    driverObj.destroy()
  }
}
