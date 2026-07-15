import { Text } from "@react-email/components"
import { EmailButton, EmailLayout, emailStyles } from "@/emails/components/layout"

export function SubscriptionCancelledEmail({
  name,
  appUrl,
}: {
  name: string
  appUrl: string
}) {
  const firstName = name.split(" ")[0]
  return (
    <EmailLayout preview="Tu plan Pro pasó a Free" appUrl={appUrl}>
      <Text style={emailStyles.heading}>Hola, {firstName}</Text>
      <Text style={emailStyles.text}>
        No pudimos procesar el cobro de tu plan Pro, así que tu cuenta ya está
        en el plan Free. Si tenías más de 3 propiedades activas, dejamos
        publicadas las más recientes y el resto quedó guardado sin publicar —
        no se pierde nada.
      </Text>
      <EmailButton href={`${appUrl}/dashboard/upgrade`}>
        Reactivar plan Pro
      </EmailButton>
    </EmailLayout>
  )
}

export default SubscriptionCancelledEmail
