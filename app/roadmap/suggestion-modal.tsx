"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { submitSuggestion, type SuggestionState } from "./actions"

export function SuggestionModal() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const [state, action, pending] = useActionState<SuggestionState, FormData>(
    async (_prev, formData) => {
      const result = await submitSuggestion(_prev, formData)
      if (result?.success) {
        toast.success("¡Tu sugerencia se envió! Muchas gracias por ayudarnos a mejorar Conexory.")
        formRef.current?.reset()
        setOpen(false)
      } else if (result?.error) {
        toast.error(result.error)
      }
      return result
    },
    null,
  )

  useEffect(() => {
    if (open) formRef.current?.reset()
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="secondary" size="lg">
          Enviar sugerencia <ArrowRight className="w-4 h-4" />
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed z-50 bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[calc(100%-2rem)] sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl shadow-black/10 p-6 sm:p-7 animate-fade-in text-left">
          <Dialog.Title className="text-lg font-black text-ink tracking-tight">
            Cuéntanos tu sugerencia
          </Dialog.Title>
          <Dialog.Description className="text-sm text-body mt-1 leading-relaxed">
            Cada función nace de feedback real. ¿Qué te gustaría ver en Conexory?
          </Dialog.Description>

          <form ref={formRef} action={action} className="mt-5 space-y-4">
            <div>
              <label htmlFor="suggestion-content" className="block text-sm font-semibold text-ink mb-1.5">
                Sugerencia
              </label>
              <textarea
                id="suggestion-content"
                name="content"
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                autoFocus
                placeholder="Me encantaría poder…"
                className="flex w-full rounded-lg border border-hairline-strong bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-mute focus:ring-2 focus:ring-ink focus:border-ink transition-all duration-200 resize-none"
              />
            </div>

            <div>
              <label htmlFor="suggestion-email" className="block text-sm font-semibold text-ink mb-1.5">
                Email <span className="font-normal text-mute">(opcional, para responderte)</span>
              </label>
              <input
                id="suggestion-email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                className="flex h-11 w-full rounded-lg border border-hairline-strong bg-white px-4 py-2 text-sm text-ink outline-none placeholder:text-mute focus:ring-2 focus:ring-ink focus:border-ink transition-all duration-200"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600" role="alert">
                {state.error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 h-11 rounded-full border border-hairline-strong text-sm font-semibold text-ink hover:bg-canvas-soft transition-colors"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 h-11 rounded-full bg-ink text-white text-sm font-bold hover:bg-elevated transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
