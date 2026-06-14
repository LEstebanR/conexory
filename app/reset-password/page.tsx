"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, ArrowRight, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    setLoading(true)
    setError("")

    const { error: authError } = await authClient.resetPassword({
      newPassword: password,
      token,
    })

    setLoading(false)
    if (authError) {
      setError("El enlace es inválido o ya expiró. Solicita uno nuevo.")
    } else {
      setDone(true)
      setTimeout(() => router.push("/login"), 3000)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-slate-500 text-sm">
          Enlace inválido.{" "}
          <Link
            href="/forgot-password"
            className="font-bold text-brand-500 hover:text-brand-600 transition-colors"
          >
            Solicitar uno nuevo →
          </Link>
        </p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-7 h-7 text-brand-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tighter mb-3">
          ¡Contraseña actualizada!
        </h1>
        <p className="text-slate-500 text-sm">Redirigiendo al inicio de sesión...</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-6">
          <KeyRound className="w-5 h-5 text-brand-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tighter mb-2">
          Nueva contraseña
        </h1>
        <p className="text-slate-500 text-sm">
          Elige una contraseña segura de al menos 8 caracteres.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
            Nueva contraseña
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="h-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm" className="block text-sm font-semibold text-slate-700">
            Confirmar contraseña
          </label>
          <Input
            id="confirm"
            type={showPass ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
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
            <>Actualizar contraseña <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
