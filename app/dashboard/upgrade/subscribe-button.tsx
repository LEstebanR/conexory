"use client"

import { useFormStatus } from "react-dom"
import { Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { subscribeAction } from "./actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" variant="secondary" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
      {pending ? "Redirigiendo a Mercado Pago…" : "Suscribirme — $99.999/mes"}
    </Button>
  )
}

// Submits straight to Mercado Pago's hosted checkout (subscribeAction
// redirects to initPoint) — no widget script, no card fields of our own.
export function SubscribeButton() {
  return (
    <form action={subscribeAction}>
      <SubmitButton />
    </form>
  )
}
