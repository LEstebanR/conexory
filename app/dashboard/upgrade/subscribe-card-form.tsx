"use client"

import { useRouter } from "next/navigation"
import { CardTokenForm } from "./card-token-form"
import { subscribeAction } from "./actions"
import { PRO_AMOUNT_COP } from "@/lib/mercadopago"

export function SubscribeCardForm({ email }: { email: string }) {
  const router = useRouter()

  return (
    <CardTokenForm
      email={email}
      amount={PRO_AMOUNT_COP}
      revealLabel={`Suscribirme — $${PRO_AMOUNT_COP.toLocaleString("es-CO")}/mes`}
      modalTitle="Confirma tu tarjeta"
      submitLabel={`Confirmar — $${PRO_AMOUNT_COP.toLocaleString("es-CO")}/mes`}
      submittingLabel="Confirmando…"
      errorMessage="No pudimos iniciar la suscripción con Mercado Pago. Intenta de nuevo."
      onTokenize={subscribeAction}
      onSuccess={() => router.push("/dashboard?upgrade=processing")}
      onFailure={(reason) => {
        if (reason === "unauthenticated") router.push("/login")
        else if (reason === "already_premium") router.push("/dashboard")
        else router.push("/dashboard/upgrade?error=preapproval_failed")
      }}
    />
  )
}
