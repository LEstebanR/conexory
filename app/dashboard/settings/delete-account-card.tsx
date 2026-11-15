"use client"

import { useActionState, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { deleteAccount, type DeleteAccountState } from "./actions"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export default function DeleteAccountCard({ email }: { email: string }) {
  const [state, formAction, isPending] = useActionState<DeleteAccountState, FormData>(deleteAccount, {})
  const [confirmEmail, setConfirmEmail] = useState("")
  const matches = normalizeEmail(confirmEmail) === normalizeEmail(email)

  return (
    <div className="bg-white rounded-2xl border border-hairline p-6">
      <div className="flex items-center gap-2 mb-3">
        <Trash2 className="w-4 h-4 text-ink" strokeWidth={1.75} />
        <h2 className="text-base font-bold text-ink">Eliminar cuenta</h2>
      </div>
      <p className="text-xs text-body leading-relaxed mb-4">
        Se borran para siempre tu perfil, tus propiedades con sus fotos y tus estadísticas. Si tienes
        Pro, cancelamos la suscripción y no se te vuelve a cobrar. No se puede deshacer.
      </p>

      <form action={formAction} className="space-y-3">
        <label htmlFor="confirmEmail" className="block text-xs text-body">
          Escribe <span className="font-bold text-ink break-all">{email}</span> para confirmar
        </label>
        <Input
          id="confirmEmail"
          name="confirmEmail"
          type="email"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder={email}
        />
        {state.error && (
          <p role="alert" className="text-xs text-danger-600">
            {state.error}
          </p>
        )}
        <Button
          type="submit"
          variant="destructive"
          size="sm"
          className="w-full"
          disabled={!matches || isPending}
        >
          {isPending ? "Eliminando…" : "Eliminar mi cuenta"}
        </Button>
      </form>
    </div>
  )
}
