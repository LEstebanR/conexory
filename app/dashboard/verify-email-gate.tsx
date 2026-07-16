"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MailCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth-client"
import { resendVerificationEmailAction } from "./verify-email-actions"

export default function VerifyEmailGate({ email }: { email: string }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const router = useRouter()

  async function handleResend() {
    setSending(true)
    try {
      const result = await resendVerificationEmailAction(email)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setSent(true)
      toast.success("Te reenviamos el correo de verificación.")
      setTimeout(() => setSent(false), 30_000)
    } finally {
      setSending(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
          router.refresh()
        },
        onError: () => setSigningOut(false),
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-hairline p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-warning-50 flex items-center justify-center">
          <MailCheck className="w-6 h-6 text-warning-600" strokeWidth={2} />
        </div>

        <h1 className="text-lg font-black text-ink tracking-tight mt-4">
          Verifica tu correo
        </h1>
        <p className="text-sm text-body mt-2 leading-relaxed">
          Te enviamos un enlace de confirmación a{" "}
          <span className="font-semibold text-ink">{email}</span>. Ábrelo
          para activar tu cuenta y acceder al dashboard.
        </p>

        <Button
          onClick={handleResend}
          disabled={sending || sent}
          className="w-full mt-6"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : sent ? (
            "Correo reenviado ✓"
          ) : (
            "Reenviar correo"
          )}
        </Button>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="text-sm font-medium text-mute hover:text-ink transition-colors mt-4 disabled:opacity-60"
        >
          {signingOut ? "Cerrando sesión…" : "¿Correo equivocado? Cerrar sesión"}
        </button>
      </div>
    </div>
  )
}
