"use client"

import { useActionState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { forgotPasswordAction } from "./actions"

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, {})

  return (
    <main className="relative min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center px-5 py-12">
      <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]">
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
          <defs>
            <pattern id="forgot-dots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#000000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#forgot-dots)" />
        </svg>
      </div>

      <Link
        href="/login"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-medium text-mute hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Volver al inicio de sesión</span>
      </Link>

      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center">
            <Image src="/mark-white.png" alt="Conexory" width={22} height={22} className="w-5.5 h-5.5" />
          </div>
          <span className="text-xl font-bold text-ink tracking-tight">Conexory</span>
        </Link>

        <div className="bg-white border border-hairline rounded-3xl p-7 sm:p-9 shadow-xl shadow-black/5">
          {state.success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-canvas-soft flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-ink" />
              </div>
              <h1 className="text-2xl font-black text-ink tracking-tight mb-2">Revisa tu correo</h1>
              <p className="text-body text-sm mb-6">
                Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-ink hover:opacity-70 transition-opacity"
              >
                Volver al inicio de sesión <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-7">
                <h1 className="text-2xl font-black text-ink tracking-tight mb-1.5">
                  ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-body text-sm">
                  Ingresa tu correo y te enviaremos un enlace para restablecerla.
                </p>
              </div>

              <form action={formAction} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-semibold text-ink">
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    className="h-12"
                  />
                  {state.errors?.email && (
                    <p className="text-xs font-medium text-red-500">{state.errors.email}</p>
                  )}
                </div>

                {state.error && (
                  <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                    {state.error}
                  </p>
                )}

                <Button type="submit" size="lg" disabled={isPending} className="w-full h-12 disabled:opacity-60">
                  {isPending ? (
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
    </main>
  )
}
