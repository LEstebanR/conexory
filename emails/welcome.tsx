import { Text } from "@react-email/components"
import { EmailButton, EmailLayout, emailStyles } from "@/emails/components/layout"

export function WelcomeEmail({
  name,
  appUrl,
}: {
  name: string
  appUrl: string
}) {
  const firstName = name.split(" ")[0]
  return (
    <EmailLayout preview="Bienvenido a Conexory" appUrl={appUrl}>
      <Text style={emailStyles.heading}>Hola, {firstName} 👋</Text>
      <Text style={emailStyles.text}>
        Tu cuenta ya está lista. Crea tu primera propiedad y compártela por
        WhatsApp en menos de un minuto.
      </Text>
      <EmailButton href={`${appUrl}/dashboard/properties/new`}>
        Crear mi primera propiedad
      </EmailButton>
    </EmailLayout>
  )
}

export default WelcomeEmail
