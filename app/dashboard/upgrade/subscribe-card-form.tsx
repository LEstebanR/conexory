"use client"

import { useEffect, useRef, useState } from "react"
import { loadMercadoPago } from "@mercadopago/sdk-js"
import { Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { subscribeAction } from "./actions"
import { PRO_AMOUNT_COP } from "@/lib/mercadopago"

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale?: string }) => MercadoPagoInstance
  }
}

interface CardFormData {
  token: string
}

interface MercadoPagoCardForm {
  getCardFormData: () => CardFormData
  unmount: () => void
}

interface CardFormFieldConfig {
  id: string
  placeholder?: string
  value?: string
}

interface CardFormConfig {
  id: string
  cardNumber: CardFormFieldConfig
  expirationDate: CardFormFieldConfig
  securityCode: CardFormFieldConfig
  cardholderName: CardFormFieldConfig
  issuer: CardFormFieldConfig
  installments: CardFormFieldConfig
  identificationType: CardFormFieldConfig
  identificationNumber: CardFormFieldConfig
  cardholderEmail: CardFormFieldConfig
}

interface MercadoPagoInstance {
  cardForm: (config: {
    amount: string
    iframe: boolean
    form: CardFormConfig
    callbacks: {
      onFormMounted: (error?: unknown) => void
      onSubmit: (event: { preventDefault: () => void }) => void
    }
  }) => MercadoPagoCardForm
}

const FIELD_IDS = {
  form: "form-checkout",
  cardNumber: "form-checkout__cardNumber",
  expirationDate: "form-checkout__expirationDate",
  securityCode: "form-checkout__securityCode",
  cardholderName: "form-checkout__cardholderName",
  issuer: "form-checkout__issuer",
  installments: "form-checkout__installments",
  identificationType: "form-checkout__identificationType",
  identificationNumber: "form-checkout__identificationNumber",
  cardholderEmail: "form-checkout__cardholderEmail",
}

const secureFieldClass =
  "flex h-11 w-full items-center rounded-lg border border-hairline-strong bg-white px-4 text-sm text-ink"

const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY

// Card capture happens entirely through Mercado Pago's own SDK: cardNumber,
// expirationDate and securityCode are mounted as iframes we never touch, so
// raw card data never reaches our server — only the resulting token does.
// Identification type options are fetched and populated by the SDK itself
// once mounted (varies by country).
export function SubscribeCardForm({ email }: { email: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "error">(
    MERCADOPAGO_PUBLIC_KEY ? "loading" : "error"
  )
  const cardFormRef = useRef<MercadoPagoCardForm | null>(null)

  useEffect(() => {
    const publicKey = MERCADOPAGO_PUBLIC_KEY
    if (!publicKey) return

    let cancelled = false

    async function init() {
      await loadMercadoPago()
      if (cancelled) return

      const mp = new window.MercadoPago(publicKey!, { locale: "es-CO" })
      const cardForm = mp.cardForm({
        amount: String(PRO_AMOUNT_COP),
        iframe: true,
        form: {
          id: FIELD_IDS.form,
          cardNumber: { id: FIELD_IDS.cardNumber, placeholder: "Número de tarjeta" },
          expirationDate: { id: FIELD_IDS.expirationDate, placeholder: "MM/AA" },
          securityCode: { id: FIELD_IDS.securityCode, placeholder: "CVV" },
          cardholderName: { id: FIELD_IDS.cardholderName, placeholder: "Nombre en la tarjeta" },
          issuer: { id: FIELD_IDS.issuer, placeholder: "Banco emisor" },
          installments: { id: FIELD_IDS.installments, placeholder: "Cuotas" },
          identificationType: { id: FIELD_IDS.identificationType, placeholder: "Tipo de documento" },
          identificationNumber: {
            id: FIELD_IDS.identificationNumber,
            placeholder: "Número de documento",
          },
          cardholderEmail: { id: FIELD_IDS.cardholderEmail, value: email },
        },
        callbacks: {
          onFormMounted: (error) => {
            if (cancelled) return
            if (error) {
              console.error("[mercadopago] cardForm mount failed:", error)
              setStatus("error")
              return
            }
            setStatus("ready")
          },
          onSubmit: (event) => {
            event.preventDefault()
            if (!cardFormRef.current) return
            setStatus("submitting")

            const { token } = cardFormRef.current.getCardFormData()
            if (!token) {
              setStatus("ready")
              toast.error("No pudimos validar los datos de la tarjeta. Revísalos e intenta de nuevo.")
              return
            }

            subscribeAction(token).catch(() => {
              if (cancelled) return
              setStatus("ready")
              toast.error("No pudimos iniciar la suscripción con Mercado Pago. Intenta de nuevo.")
            })
          },
        },
      })
      cardFormRef.current = cardForm
    }

    init()

    return () => {
      cancelled = true
      cardFormRef.current?.unmount()
    }
  }, [email])

  const disabled = status !== "ready" && status !== "submitting"

  return (
    <form id={FIELD_IDS.form} className="space-y-3">
      <div id={FIELD_IDS.cardNumber} className={secureFieldClass} />
      <div className="grid grid-cols-2 gap-3">
        <div id={FIELD_IDS.expirationDate} className={secureFieldClass} />
        <div id={FIELD_IDS.securityCode} className={secureFieldClass} />
      </div>
      <Input id={FIELD_IDS.cardholderName} placeholder="Nombre en la tarjeta" autoComplete="cc-name" />
      <div className="grid grid-cols-[auto_1fr] gap-3">
        <select
          id={FIELD_IDS.identificationType}
          className="h-11 rounded-lg border border-hairline-strong bg-white px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ink focus:border-ink"
        />
        <Input id={FIELD_IDS.identificationNumber} placeholder="Número de documento" />
      </div>
      <select id={FIELD_IDS.issuer} className="hidden" />
      <select id={FIELD_IDS.installments} className="hidden" />
      <input id={FIELD_IDS.cardholderEmail} type="hidden" defaultValue={email} />

      <Button type="submit" size="lg" variant="secondary" className="w-full" disabled={disabled}>
        {status === "loading" || status === "submitting" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        {status === "submitting" ? "Confirmando…" : `Suscribirme — $${PRO_AMOUNT_COP.toLocaleString("es-CO")}/mes`}
      </Button>
      {status === "error" && (
        <p className="text-xs text-warning-200 text-center">
          No pudimos cargar el formulario de pago. Recarga la página e intenta de nuevo.
        </p>
      )}
    </form>
  )
}
