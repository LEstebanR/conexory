import { pageMetadata } from "@/lib/page-metadata"

export const metadata = pageMetadata({
  title: "Recuperar contraseña",
  description: "Recupera el acceso a tu cuenta de Conexory.",
  path: "/forgot-password",
  noindex: true,
})

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
