"use client"

import { useState } from "react"
import Link from "next/link"
import { Building2, ArrowRight, Mail, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error: authError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    })

    setLoading(false)
    if (authError) {
      setError("Ocurrió un error. Intenta de nuevo.")
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center gap-2.5 p-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-400 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black text-slate-950 tracking-tight">MiAgente</span>
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors mb-10 w-fit"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Volver a iniciar sesión
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-7 h-7 text-brand-500" />
              </div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tighter mb-3">
                Revisa tu correo
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Si existe una cuenta con ese correo, recibirás un enlace para crear una nueva contraseña en los próximos minutos.
              </p>
              <Link
                href="/login"
                className="text-sm font-bold text-brand-500 hover:text-brand-600 transition-colors"
              >
                Volver al inicio de sesión →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
                  <Mail className="w-5 h-5 text-brand-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-950 tracking-tighter mb-2">
                  Recuperar contraseña
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-12"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full h-12 font-bold shadow-sm shadow-brand-400/20 mt-2 disabled:opacity-60"
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <>Enviar enlace <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
