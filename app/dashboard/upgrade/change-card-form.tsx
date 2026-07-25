"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CardTokenForm } from "./card-token-form"
import { changeCardAction } from "./actions"
import { PRO_AMOUNT_COP } from "@/lib/mercadopago"

export function ChangeCardForm({ email }: { email: string }) {
  const router = useRouter()

  return (
    <CardTokenForm
      email={email}
      amount={PRO_AMOUNT_COP}
      revealLabel="Cambiar tarjeta"
      modalTitle="Nueva tarjeta"
      errorMessage="No pudimos actualizar la tarjeta. Intenta de nuevo."
      onTokenize={changeCardAction}
      onSuccess={() => {
        toast.success("Tarjeta actualizada")
        router.refresh()
      }}
    />
  )
}
