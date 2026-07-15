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
        Tu cuenta de Conexory ya está lista. Crea tu primera propiedad, obtén
        un link único con vista previa enriquecida y compártelo por WhatsApp —
        todo en menos de un minuto, sin nada técnico de por medio.
      </Text>
      <EmailButton href={`${appUrl}/dashboard/properties/new`}>
        Crear mi primera propiedad
      </EmailButton>
    </EmailLayout>
  )
}

export default WelcomeEmail
