import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { pageMetadata } from "@/lib/page-metadata"

export const metadata = pageMetadata({
  title: "Iniciar sesión",
  description: "Inicia sesión en Conexory para publicar y compartir tus propiedades.",
  path: "/login",
  noindex: true,
})

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (session) redirect("/dashboard")
  return <>{children}</>
}
