"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react"
import * as Dialog from "@radix-ui/react-dialog"
import { Lock } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY

// initMercadoPago() only needs to run once per page load, regardless of how
// many CardTokenForm instances mount (SubscribeCardForm, ChangeCardForm).
let mercadoPagoInitialized = false

export interface TokenizedCard {
  cardTokenId: string
  cardBrand: string
  cardLastFour: string
}

interface CardTokenFormProps {
  email: string
  amount: number
  revealLabel: string
  modalTitle: string
  errorMessage: string
  onTokenize: (card: TokenizedCard) => Promise<{ ok: boolean; reason?: string }>
  onSuccess: () => void
  onFailure?: (reason?: string) => void
}

// Shared card-capture building block for both subscribing and swapping a
// subscription's card, rendered inside a modal so Mercado Pago's own Payment
// Brick UI (which we don't fully control the styling of) reads as a distinct
// "their widget" step rather than part of our page. Raw card data never
// reaches our server — only the resulting token does — but unlike the
// previous Secure Fields form, the Brick also hands us the card's brand and
// last four digits directly in onSubmit, so we don't have to wait for
// Mercado Pago's webhook to display them.
export function CardTokenForm({
  email,
  amount,
  revealLabel,
  modalTitle,
  errorMessage,
  onTokenize,
  onSuccess,
  onFailure,
}: CardTokenFormProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!MERCADOPAGO_PUBLIC_KEY || mercadoPagoInitialized) return
    initMercadoPago(MERCADOPAGO_PUBLIC_KEY, { locale: "es-CO" })
    mercadoPagoInitialized = true
  }, [])

  // The Brick reinitializes itself whenever the object/function references it
  // receives change — setSubmitting below re-renders this component, so
  // initialization/customization/onSubmit/onError all need stable identities
  // across that re-render or the Brick tears itself down and remounts mid
  // submit, corrupting the flow instead of just showing a loading state.
  const initialization = useMemo(() => ({ amount, payer: { email } }), [amount, email])
  const customization = useMemo(() => ({ visual: { hideFormTitle: true } }), [])

  const handleSubmit = useCallback(
    async (
      formData: { token: string; payment_method_id: string },
      additionalData?: { lastFourDigits?: string },
    ) => {
      setSubmitting(true)
      let handledFailure = false
      try {
        const result = await onTokenize({
          cardTokenId: formData.token,
          cardBrand: formData.payment_method_id,
          cardLastFour: additionalData?.lastFourDigits ?? "",
        })
        if (result.ok) {
          setOpen(false)
          onSuccess()
          return
        }
        handledFailure = true
        if (onFailure) onFailure(result.reason)
        else toast.error(errorMessage)
        throw new Error(result.reason ?? "payment_action_failed")
      } catch (error) {
        if (!handledFailure) toast.error(errorMessage)
        throw error
      } finally {
        setSubmitting(false)
      }
    },
    [onTokenize, onSuccess, onFailure, errorMessage],
  )

  const handleError = useCallback((error: unknown) => {
    console.error("[mercadopago] CardPayment brick error:", error)
  }, [])

  if (!MERCADOPAGO_PUBLIC_KEY) {
    return (
      <p className="text-xs text-warning-200 text-center">
        No pudimos cargar el formulario de pago. Recarga la página e intenta de nuevo.
      </p>
    )
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !submitting && setOpen(next)}>
      <Dialog.Trigger asChild>
        <Button type="button" size="lg" variant="secondary" className="w-full">
          <Lock className="w-4 h-4" />
          {revealLabel}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[calc(100%-2rem)] sm:max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl shadow-black/10 p-6 sm:p-7 animate-fade-in text-left">
          <Dialog.Title className="text-lg font-black text-ink tracking-tight mb-4">
            {modalTitle}
          </Dialog.Title>

          {open && (
            <CardPayment
              initialization={initialization}
              customization={customization}
              locale="es-CO"
              onSubmit={handleSubmit}
              onError={handleError}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
