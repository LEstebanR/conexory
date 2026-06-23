import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight } from "lucide-react"
import ResetForm from "./reset-form"

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { token, error } = await searchParams

  const isInvalid = error === "INVALID_TOKEN" || (!token && !error)

  return (
    <main className="relative min-h-screen bg-white overflow-hidden flex flex-col items-center justify-center px-5 py-12">
      <div className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]">
        <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
          <defs>
            <pattern id="reset-dots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#000000" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#reset-dots)" />
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
          {isInvalid ? (
            <div className="text-center py-4">
              <h1 className="text-2xl font-black text-ink tracking-tight mb-2">Enlace inválido</h1>
              <p className="text-body text-sm mb-6">
                Este enlace es inválido o ha expirado. Solicita uno nuevo desde la página de recuperación.
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-2 text-sm font-bold text-ink hover:opacity-70 transition-opacity"
              >
                Solicitar nuevo enlace <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <ResetForm token={token!} />
          )}
        </div>
      </div>
    </main>
  )
}
