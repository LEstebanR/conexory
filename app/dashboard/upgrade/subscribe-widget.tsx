"use client"

import { useEffect, useRef, useState } from "react"
import { Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Wompi's tokenization widget captures the card in its own UI (we never render
// card fields → lower PCI scope) and, on success, POSTs the form — with an
// id_token — to /api/subscription/tokenize. That POST takes a few seconds
// (create payment source + first charge) before redirecting, so we show a loader
// the instant the widget submits, keeping feedback continuous until the dashboard
// takes over.
export function SubscribeWidget({ publicKey }: { publicKey: string }) {
  const host = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!host.current || mounted.current) return
    mounted.current = true

    const form = document.createElement("form")
    form.setAttribute("method", "POST")
    form.setAttribute("action", "/api/subscription/tokenize")

    // The widget submits the form once tokenization succeeds. Cover both
    // submit() (programmatic, doesn't fire the event) and requestSubmit().
    const showLoader = () => setSubmitting(true)
    form.addEventListener("submit", showLoader)
    const nativeSubmit = form.submit.bind(form)
    form.submit = () => {
      showLoader()
      nativeSubmit()
    }

    const script = document.createElement("script")
    script.src = "https://checkout.wompi.co/widget.js"
    script.setAttribute("data-render", "button")
    script.setAttribute("data-widget-operation", "tokenize")
    script.setAttribute("data-public-key", publicKey)

    form.appendChild(script)
    host.current.appendChild(form)
  }, [publicKey])

  function openWidget() {
    const trigger = host.current?.querySelector(
      "button, a",
    ) as HTMLElement | null
    trigger?.click()
  }

  return (
    <>
      <div
        ref={host}
        aria-hidden
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      <Button
        type="button"
        size="lg"
        variant="secondary"
        className="w-full"
        onClick={openWidget}
        disabled={submitting}
      >
        <Zap className="w-4 h-4" />
        Suscribirme — $99.999/mes
      </Button>

      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <Loader2
              className="w-8 h-8 animate-spin mx-auto text-ink mb-4"
              strokeWidth={2}
            />
            <h2 className="text-lg font-black text-ink tracking-tighter">
              Procesando tu pago…
            </h2>
            <p className="text-sm text-body mt-1">
              Un momento, estamos registrando tu tarjeta.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
