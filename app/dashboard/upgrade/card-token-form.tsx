"use client"

import { useEffect, useRef, useState } from "react"
import { loadMercadoPago } from "@mercadopago/sdk-js"
import * as Dialog from "@radix-ui/react-dialog"
import { Loader2, Lock, X } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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

interface CardTokenFormProps {
  email: string
  amount: number
  revealLabel: string
  modalTitle: string
  submitLabel: string
  submittingLabel: string
  errorMessage: string
  onTokenize: (cardTokenId: string) => Promise<{ ok: boolean; reason?: string }>
  onSuccess: () => void
  onFailure?: (reason?: string) => void
}

// Shared card-capture building block for both subscribing and swapping a
// subscription's card, rendered inside a modal so Mercado Pago's own form
// reads as a distinct "their widget" step rather than part of our page.
// cardNumber, expirationDate and securityCode are mounted as Mercado Pago
// iframes we never touch, so raw card data never reaches our server — only
// the resulting token does. The Payment Brick (Mercado Pago's newer,
// React-friendly widget) was tried here first because it hands back the
// card's brand/last-four-digits immediately — but its tokens turned out to
// be rejected by the Suscripciones API ("CC_VAL_433"), which only accepts
// tokens from this classic card-tokens flow. Brand/last-four instead come
// from a server-side lookup right after tokenizing (see lib/subscription.ts,
// app/dashboard/upgrade/actions.ts) — still immediate, just not from the
// client.
export function CardTokenForm({
  email,
  amount,
  revealLabel,
  modalTitle,
  submitLabel,
  submittingLabel,
  errorMessage,
  onTokenize,
  onSuccess,
  onFailure,
}: CardTokenFormProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<"loading" | "ready" | "submitting" | "error">(
    MERCADOPAGO_PUBLIC_KEY ? "loading" : "error"
  )
  const cardFormRef = useRef<MercadoPagoCardForm | null>(null)

  useEffect(() => {
    const publicKey = MERCADOPAGO_PUBLIC_KEY
    if (!open || !publicKey) return

    let cancelled = false

    async function init() {
      await loadMercadoPago()
      if (cancelled) return

      const mp = new window.MercadoPago(publicKey!, { locale: "es-CO" })
      const cardForm = mp.cardForm({
        amount: String(amount),
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

            onTokenize(token)
              .then((result) => {
                if (cancelled) return
                if (result.ok) {
                  setStatus("ready")
                  setOpen(false)
                  onSuccess()
                  return
                }
                setStatus("ready")
                if (onFailure) onFailure(result.reason)
                else toast.error(errorMessage)
              })
              .catch(() => {
                if (cancelled) return
                setStatus("ready")
                toast.error(errorMessage)
              })
          },
        },
      })
      cardFormRef.current = cardForm
    }

    init()

    return () => {
      cancelled = true
      // Blur before unmounting: the card iframes (CVV in particular) can be
      // holding focus when the modal closes, and browsers key their native
      // autofill/password popovers off frame focus — removing the iframe
      // without blurring it first can leave that popover stranded on screen.
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      document
        .querySelectorAll<HTMLIFrameElement>(`#${FIELD_IDS.form} iframe`)
        .forEach((iframe) => iframe.blur())
      cardFormRef.current?.unmount()
      cardFormRef.current = null
    }
  }, [open, email, amount, onTokenize, onSuccess, onFailure, errorMessage])

  const disabled = status !== "ready" && status !== "submitting"

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (status === "submitting") return
        if (next && MERCADOPAGO_PUBLIC_KEY) setStatus("loading")
        setOpen(next)
      }}
    >
      <Dialog.Trigger asChild>
        <Button type="button" size="lg" variant="secondary" className="w-full">
          <Lock className="w-4 h-4" />
          {revealLabel}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        {/* Centering via flex instead of top/left + transform — a transformed
            ancestor is what makes browsers mis-anchor their native autofill
            popover for the plain-text fields below (cardholder name, document).
            Full-screen on mobile instead of a half-height bottom sheet: with a
            form this long, a short sheet just meant more scrolling inside a
            cramped box. */}
        <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center">
          <Dialog.Content className="relative flex flex-col w-full h-[100dvh] sm:h-auto sm:w-[calc(100%-2rem)] sm:max-w-md sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl shadow-black/10 animate-fade-in text-left overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 sm:px-7 sm:pt-7 pb-4">
              <Dialog.Title className="text-lg font-black text-ink tracking-tight">
                {modalTitle}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Cerrar"
                  className="rounded-full p-2 text-body hover:bg-canvas-soft transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            <form
              id={FIELD_IDS.form}
              autoComplete="off"
              className="flex-1 overflow-y-auto px-6 sm:px-7 pb-6 sm:pb-7 space-y-3"
            >
              <div id={FIELD_IDS.cardNumber} className={secureFieldClass} />
              <div className="grid grid-cols-2 gap-3">
                <div id={FIELD_IDS.expirationDate} className={secureFieldClass} />
                <div id={FIELD_IDS.securityCode} className={secureFieldClass} />
              </div>
              <Input
                id={FIELD_IDS.cardholderName}
                placeholder="Nombre en la tarjeta"
                autoComplete="off"
              />
              <div className="grid grid-cols-[auto_1fr] gap-3">
                <select
                  id={FIELD_IDS.identificationType}
                  className="h-11 rounded-lg border border-hairline-strong bg-white px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ink focus:border-ink"
                />
                <Input
                  id={FIELD_IDS.identificationNumber}
                  placeholder="Número de documento"
                  autoComplete="off"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
              <select id={FIELD_IDS.issuer} className="hidden" />
              <select id={FIELD_IDS.installments} className="hidden" />
              <input id={FIELD_IDS.cardholderEmail} type="hidden" defaultValue={email} />

              <Button type="submit" size="lg" className="w-full" disabled={disabled}>
                {status === "loading" || status === "submitting" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                {status === "submitting" ? submittingLabel : submitLabel}
              </Button>
              {status === "error" && (
                <p className="text-xs text-red-600 text-center">
                  No pudimos cargar el formulario de pago. Cierra y vuelve a intentar.
                </p>
              )}
            </form>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
