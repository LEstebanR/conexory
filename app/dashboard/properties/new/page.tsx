import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { hasProAccess } from "@/lib/plans"
import NewPropertyForm from "./new-property-form"

export default async function NewPropertyPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return <NewPropertyForm isPremium={hasProAccess(session.user)} />
}
