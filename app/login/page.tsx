"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, Eye, EyeOff, ArrowRight, MessageCircle, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn } from "@/lib/auth-client"

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

function MiniPropertyCard() {
  return (
    <div className="bg-white/8 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden w-full max-w-[260px]">
      <div className="relative h-28 bg-gradient-to-br from-brand-300/40 via-brand-400/50 to-brand-500/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="grid grid-cols-3 gap-1 w-24">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`bg-white rounded-sm ${i < 3 ? "h-10" : "h-6"}`} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 p-3">
          <p className="text-[9px] text-white/60 font-medium">Chapinero · Bogotá</p>
          <p className="text-xs font-bold text-white leading-tight">Apartamento moderno</p>
        </div>
        <div className="absolute top-2 right-2 bg-brand-400 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
          En venta
        </div>
      </div>
      <div className="p-3 space-y-2.5">
        <div>
          <p className="text-lg font-black text-white tracking-tighter leading-none">$2.800.000</p>
          <p className="text-[9px] text-white/40 font-medium">COP / mes</p>
        </div>
        <div className="flex gap-3">
          {["🛏 2 hab", "🚿 1 baño", "📐 65m²"].map((d) => (
            <span key={d} className="text-[9px] text-white/50 font-medium">{d}</span>
          ))}
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 bg-[#25D366]/20 rounded-xl py-1.5 flex items-center justify-center">
            <MessageCircle className="w-2.5 h-2.5 text-[#25D366]" />
          </div>
          <div className="flex-1 bg-white/10 rounded-xl py-1.5 flex items-center justify-center">
            <Link2 className="w-2.5 h-2.5 text-white/50" />
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-[420px] xl:w-[460px] flex-col flex-shrink-0 relative bg-slate-950 p-10 xl:p-12 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400/6 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
      </div>

      <Link href="/" className="relative flex items-center gap-2.5 w-fit">
        <div className="w-9 h-9 rounded-xl bg-brand-400 flex items-center justify-center shadow-lg shadow-brand-400/30">
          <Building2 className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-xl font-black text-white tracking-tight">MiAgente</span>
      </Link>

      <div className="relative flex-1 flex flex-col justify-center gap-8 py-12">
        <div>
          <p className="text-brand-400 font-bold text-xs uppercase tracking-[0.2em] mb-5">
            Bienvenido de vuelta
          </p>
          <h2 className="text-4xl xl:text-5xl font-black text-white tracking-tighter leading-none">
            Tus propiedades<br />
            <span className="text-brand-400">te esperan.</span>
          </h2>
        </div>
        <MiniPropertyCard />
        <p className="text-sm text-slate-500 leading-relaxed">
          Retoma donde lo dejaste. Tus propiedades y links siguen exactamente como los dejaste.
        </p>
      </div>

      <div className="relative">
        <div className="h-px w-full bg-white/8 mb-6" />
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[{ bg: "bg-amber-400", l: "C" }, { bg: "bg-blue-500", l: "M" }, { bg: "bg-violet-500", l: "A" }].map((a) => (
              <div key={a.l} className={`w-7 h-7 rounded-full ${a.bg} border-2 border-slate-950 flex items-center justify-center text-white text-[10px] font-bold`}>
                {a.l}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-400">
            <span className="text-white font-bold">+480 agentes</span> ya usan MiAgente
          </p>
        </div>
      </div>
    </div>
  )
}

const AUTH_ERRORS: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email o contraseña incorrectos.",
  EMAIL_NOT_VERIFIED: "Verifica tu email antes de continuar.",
  TOO_MANY_REQUESTS: "Demasiados intentos. Espera unos minutos.",
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error: authError } = await signIn.email({
      email,
      password,
    })

    if (authError) {
      setError(AUTH_ERRORS[authError.code ?? ""] ?? "Email o contraseña incorrectos.")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError("")
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    })
    // La redirección la maneja Better Auth
  }

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 p-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-400 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black text-slate-950 tracking-tight">MiAgente</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-12 max-w-lg lg:max-w-none mx-auto w-full">
          <Link href="/" className="hidden lg:inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors mb-12 w-fit">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Volver al inicio
          </Link>

          <div className="max-w-sm xl:max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-950 tracking-tighter mb-2">
                Iniciar sesión
              </h1>
              <p className="text-slate-500 text-sm">Ingresa a tu cuenta de MiAgente</p>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-xs mb-6 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <svg className="animate-spin w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <GoogleIcon />
              )}
              Continuar con Google
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  o con tu correo
                </span>
              </div>
            </div>

            {/* Form */}
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Contraseña
                  </label>
                  <Link href="/forgot-password" className="text-xs text-brand-500 font-semibold hover:text-brand-600 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
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
                  <>Iniciar sesión <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-8">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="font-bold text-brand-500 hover:text-brand-600 transition-colors">
                Crear cuenta gratis →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
