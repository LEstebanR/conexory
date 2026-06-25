"use client"

import { useState, useActionState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "@/lib/auth-client"
import { loginAction } from "./actions"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [state, formAction, isPending] = useActionState(loginAction, {})
  const [redirectTo] = useState(() => {
    if (typeof window === "undefined") return "/dashboard"
    const r = new URLSearchParams(window.location.search).get("redirect")
    return r?.startsWith("/") ? r : "/dashboard"
  })

  const [passwordReset] = useState(() => {
    if (typeof window === "undefined") return false
    return new URLSearchParams(window.location.search).get("passwordReset") === "true"
  })

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn.social({ provider: "google", callbackURL: redirectTo })
  }

  return (
    <main className="relative min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center px-5 py-12">
      {/* Background dot grid */}
      <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]">
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
          <defs>
            <pattern id="login-dots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#000000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-dots)" />
        </svg>
      </div>

      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-sm font-medium text-mute hover:text-ink transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Volver al inicio</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center">
            <Image src="/mark-white.png" alt="Conexory" width={22} height={22} className="w-5.5 h-5.5" />
          </div>
          <span className="text-xl font-bold text-ink tracking-tight">Conexory</span>
        </Link>

        {/* Card */}
        <div className="bg-white border border-hairline rounded-3xl p-7 sm:p-9 shadow-xl shadow-black/5">
          {passwordReset && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-canvas-soft border border-hairline text-sm text-ink font-medium text-center">
              Contraseña actualizada. Ya puedes iniciar sesión.
            </div>
          )}

          <div className="text-center mb-7">
            <h1 className="text-2xl font-black text-ink tracking-tight mb-1.5">
              Bienvenido de vuelta
            </h1>
            <p className="text-body text-sm">Ingresa a tu cuenta de Conexory</p>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-full border border-hairline-strong bg-white text-ink text-sm font-semibold hover:bg-canvas-soft transition-colors mb-5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin w-4 h-4 text-mute" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <GoogleIcon />
            )}
            Continuar con Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-hairline" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-mute font-semibold uppercase tracking-wider">
                o con tu correo
              </span>
            </div>
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="redirect" value={redirectTo} />
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-ink">
                Correo electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="h-12"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-ink">
                  Contraseña
                </label>
                <Link href="/forgot-password" className="text-xs text-ink font-semibold hover:opacity-70 transition-opacity">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors"
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                <>Iniciar sesión <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-body mt-6">
          ¿No tienes cuenta?{" "}
          <Link
            href={redirectTo !== "/dashboard" ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
            className="font-bold text-ink hover:opacity-70 transition-opacity"
          >
            Crear cuenta gratis
          </Link>
        </p>
      </div>
    </main>
  )
}
