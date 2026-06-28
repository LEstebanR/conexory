"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { resetPasswordAction } from "./actions"

export default function ResetForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, {})
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const passwordsMatch = confirm === "" || password === confirm

  return (
    <>
      <div className="text-center mb-7">
        <h1 className="text-2xl font-black text-ink tracking-tight mb-1.5">Nueva contraseña</h1>
        <p className="text-body text-sm">Elige una contraseña segura de al menos 8 caracteres.</p>
      </div>

      <form action={formAction} noValidate className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-ink">
            Nueva contraseña
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="h-12 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors"
              aria-label={showPass ? "Ocultar" : "Mostrar"}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    password.length >= level * 2
                      ? level <= 2 ? "bg-warning-400" : "bg-ink"
                      : "bg-canvas-soft"
                  )}
                />
              ))}
            </div>
          )}
          {state.errors?.password && (
            <p className="text-xs font-medium text-red-500">{state.errors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirm-password" className="block text-sm font-semibold text-ink">
            Confirmar contraseña
          </label>
          <div className="relative">
            <Input
              id="confirm-password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Repite tu contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className={cn(
                "h-12 pr-12",
                !passwordsMatch && "border-red-400 focus:ring-red-400 focus:border-red-400"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors"
              aria-label={showConfirm ? "Ocultar" : "Mostrar"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {!passwordsMatch && (
            <p className="text-xs text-red-500 font-medium">Las contraseñas no coinciden</p>
          )}
          {state.errors?.confirmPassword && (
            <p className="text-xs font-medium text-red-500">{state.errors.confirmPassword}</p>
          )}
        </div>

        {state.error && (
          <p className="text-sm text-red-600 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={!passwordsMatch || password.length < 8 || isPending}
          className="w-full h-12 disabled:opacity-50"
        >
          {isPending ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <>Guardar contraseña <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-body mt-6">
        <Link href="/login" className="font-bold text-ink hover:opacity-70 transition-opacity">
          Volver al inicio de sesión
        </Link>
      </p>
    </>
  )
}
