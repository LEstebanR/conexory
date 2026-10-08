import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { pageMetadata } from "@/lib/page-metadata"

export const metadata = pageMetadata({
  title: "Crear cuenta",
  description: "Crea tu cuenta de Conexory y publica tu primera propiedad.",
  path: "/register",
  noindex: true,
})

export default async function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (session) redirect("/dashboard")
  return <>{children}</>
}
