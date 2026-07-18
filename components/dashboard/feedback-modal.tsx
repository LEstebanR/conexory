"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { MessageSquareHeart, Loader2 } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { submitFeedback, type FeedbackState } from "@/app/dashboard/actions"

export default function FeedbackModal({ userName }: { userName: string }) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const [state, action, pending] = useActionState<FeedbackState, FormData>(
    async (_prev, formData) => {
      const result = await submitFeedback(_prev, formData)
      if (result?.success) {
        toast.success("¡Gracias por tu feedback!")
        formRef.current?.reset()
        setOpen(false)
      } else if (result?.error) {
        toast.error(result.error)
      }
      return result
    },
    null
  )

  useEffect(() => {
    if (open) formRef.current?.reset()
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-body hover:bg-canvas-softer hover:text-ink transition-all duration-150"
        >
          <MessageSquareHeart className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.75} />
          <span className="text-sm font-medium flex-1 text-left">Danos tu feedback</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed z-50 inset-0 flex flex-col items-center justify-center sm:block sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[calc(100%-2rem)] sm:max-w-md bg-white rounded-none sm:rounded-2xl shadow-2xl shadow-black/10 p-7 animate-fade-in">
          <div className="w-full max-w-sm text-left">
            <Dialog.Title className="text-lg font-black text-ink tracking-tight">
              Cuéntanos qué piensas
            </Dialog.Title>
            <Dialog.Description className="text-sm text-body mt-1 leading-relaxed">
              Ideas, problemas, lo que sea. Leemos todo.
            </Dialog.Description>

            <form ref={formRef} action={action} className="mt-5 space-y-4">
              <div>
                <label htmlFor="feedback-name" className="block text-sm font-semibold text-ink mb-1.5">
                  Nombre <span className="font-normal text-mute">(opcional)</span>
                </label>
                <input
                  id="feedback-name"
                  name="name"
                  type="text"
                  defaultValue={userName}
                  maxLength={120}
                  className="flex h-11 w-full rounded-lg border border-hairline-strong bg-white px-4 py-2 text-sm text-ink outline-none placeholder:text-mute focus:ring-2 focus:ring-ink focus:border-ink transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="feedback-message" className="block text-sm font-semibold text-ink mb-1.5">
                  Mensaje
                </label>
                <textarea
                  id="feedback-message"
                  name="message"
                  required
                  minLength={3}
                  maxLength={2000}
                  rows={4}
                  autoFocus
                  placeholder="Cuéntanos qué te gustaría mejorar…"
                  className="flex w-full rounded-lg border border-hairline-strong bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-mute focus:ring-2 focus:ring-ink focus:border-ink transition-all duration-200 resize-none"
                />
              </div>

              {state?.error && (
                <p className="text-sm text-red-600" role="alert">
                  {state.error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Dialog.Close asChild>
                  <Button type="button" variant="secondary" className="flex-1">
                    Cancelar
                  </Button>
                </Dialog.Close>
                <Button type="submit" variant="default" className="flex-1" disabled={pending}>
                  {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar"}
                </Button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
