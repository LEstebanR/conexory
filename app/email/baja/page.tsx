import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { verifyUnsubscribeToken } from "@/lib/unsubscribe"
import { unsubscribe } from "./actions"

export const metadata: Metadata = {
  title: "Darse de baja",
  robots: { index: false, follow: false },
}

// The email link only lands here; the opt-out needs a button press so link
// scanners that prefetch URLs never unsubscribe anyone.
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; listo?: string }>
}) {
  const { token, listo } = await searchParams
  const valid = !!token && verifyUnsubscribeToken(token) !== null

  return (
    <main className="min-h-dvh bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-hairline p-8 text-center">
        {listo ? (
          <>
            <h1 className="text-2xl font-bold text-ink">Listo</h1>
            <p className="mt-3 text-body">Ya no recibirás estos correos de Conexory.</p>
          </>
        ) : valid ? (
          <>
            <h1 className="text-2xl font-bold text-ink">¿Dejar de recibir estos correos?</h1>
            <p className="mt-3 text-body">
              Seguirás recibiendo los correos de tu cuenta y de pagos.
            </p>
            <form action={unsubscribe} className="mt-6">
              <input type="hidden" name="token" value={token} />
              <Button type="submit" className="w-full">Darme de baja</Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-ink">Enlace no válido</h1>
            <p className="mt-3 text-body">Este enlace de baja no es válido o está incompleto.</p>
          </>
        )}
        <Link href="/" className="mt-6 inline-block text-sm text-body underline">
          Ir a Conexory
        </Link>
      </div>
    </main>
  )
}
