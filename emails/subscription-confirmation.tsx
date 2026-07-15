import { Text } from "@react-email/components"
import { EmailButton, EmailLayout, emailStyles } from "@/emails/components/layout"

export function SubscriptionConfirmationEmail({
  name,
  appUrl,
}: {
  name: string
  appUrl: string
}) {
  const firstName = name.split(" ")[0]
  return (
    <EmailLayout preview="Tu plan Pro ya está activo" appUrl={appUrl}>
      <Text style={emailStyles.heading}>Hola, {firstName} 👋</Text>
      <Text style={emailStyles.text}>
        Tu suscripción al plan Pro de Conexory está activa. Ya puedes publicar
        hasta 50 propiedades con 20 fotos cada una, y tus fichas se ven igual
        de profesionales que siempre.
      </Text>
      <EmailButton href={`${appUrl}/dashboard`}>Ir al dashboard</EmailButton>
    </EmailLayout>
  )
}

export default SubscriptionConfirmationEmail
