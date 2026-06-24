"use client"

import { useEffect, useRef } from "react"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

// Wompi's tokenization widget captures the card in its own UI (we never render
// card fields → lower PCI scope) and, on success, POSTs the form — with an
// id_token — to /api/subscription/tokenize.
//
// The widget requires the <script> to sit directly inside a <form method="POST">
// and reads that method literally; React keeps re-serializing it to lowercase, so
// we build the whole form by hand (DOM, not JSX) and only trigger its hidden
// button from our own styled CTA.
export function SubscribeWidget({ publicKey }: { publicKey: string }) {
  const host = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)

  useEffect(() => {
    if (!host.current || mounted.current) return
    mounted.current = true

    const form = document.createElement("form")
    form.setAttribute("method", "POST")
    form.setAttribute("action", "/api/subscription/tokenize")

    const script = document.createElement("script")
    script.src = "https://checkout.wompi.co/widget.js"
    script.setAttribute("data-render", "button")
    script.setAttribute("data-widget-operation", "tokenize")
    script.setAttribute("data-public-key", publicKey)

    form.appendChild(script)
    host.current.appendChild(form)
  }, [publicKey])

  function openWidget() {
    const trigger = host.current?.querySelector("button, a") as HTMLElement | null
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
      >
        <Zap className="w-4 h-4" />
        Suscribirme — $99.999/mes
      </Button>
    </>
  )
}
